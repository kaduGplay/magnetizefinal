import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { hideAuthOverlay, showAuthOverlay } from "@/lib/authOverlay";
import { toast } from "@/components/ui/sonner";

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  credits: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  access_code_last4: string | null;
}

const PROFILE_KEY = "magnetize_user";
const TOKEN_KEY = "magnetize_access_token";
const PROFILE_EVENT = "magnetize:profile-changed";
const OAUTH_PENDING_KEY = "magnetize_oauth_pending";

type AuthResponse = Record<string, unknown> & { success?: boolean; error?: string; statusCode?: number };
type AuthResult = { error: { message: string } | null; needsEmailConfirmation?: boolean; redirected?: boolean };

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const callAccessApi = async (payload: Record<string, unknown>, bearerToken?: string): Promise<AuthResponse> => {
  const requestToken = getAccessToken();
  const result = await requestAccessApi(payload, bearerToken);
  if (
    result.statusCode !== 401 ||
    bearerToken ||
    ["identity", "login-code", "generate-code", "logout"].includes(String(payload.action))
  ) {
    return result;
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.access_token) {
      const restored = await syncIdentity(data.session.access_token);
      if (restored.success && typeof restored.token === "string") {
        storeAccess(restored);
        return await requestAccessApi(payload);
      }
      // Temporary connection failures must not erase a valid identity.
      if (restored.statusCode !== 401) return restored;
    }
  } catch {
    return { success: false, error: "Erro de conexão." };
  }
  if (getAccessToken() === requestToken) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: null }));
  }
  return result;
};

const requestAccessApi = async (payload: Record<string, unknown>, bearerToken?: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${bearerToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        ...(getAccessToken() ? { "x-access-token": getAccessToken() as string } : {}),
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    return response.ok && body.success
      ? body
      : { success: false, statusCode: response.status, error: body.error || "Erro de conexão." };
  } catch {
    return { success: false, error: "Erro de conexão." };
  }
};

const toProfile = (data: AuthResponse): UserProfile => ({
  id: String(data.userId),
  full_name: String(data.fullName || data.email || "Cliente Magnetize"),
  phone: typeof data.phone === "string" ? data.phone : null,
  email: typeof data.email === "string" ? data.email : null,
  credits: Number(data.credits || 0),
  is_premium: Boolean(data.isPremium),
  premium_expires_at: typeof data.premiumExpiresAt === "string" ? data.premiumExpiresAt : null,
  access_code_last4: typeof data.accessCodeLast4 === "string" ? data.accessCodeLast4 : null,
});

const storeAccess = (data: AuthResponse) => {
  if (typeof data.token === "string") localStorage.setItem(TOKEN_KEY, data.token);
  const next = toProfile(data);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: next }));
  return next;
};

let identitySync: Promise<AuthResponse> | null = null;

const syncIdentity = async (accessToken: string): Promise<AuthResponse> => {
  if (!identitySync) {
    identitySync = callAccessApi({ action: "identity" }, accessToken).finally(() => {
      identitySync = null;
    });
  }
  return identitySync;
};

const friendlyAuthError = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Este e-mail já está cadastrado. Faça login.";
  if (normalized.includes("password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  return message || "Não foi possível entrar. Tente novamente.";
};

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAccess = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: null }));
  }, []);

  const applyAccess = useCallback((data: AuthResponse) => {
    const next = storeAccess(data);
    setProfile(next);
    setIsLoading(false);
    return next;
  }, []);

  const syncCurrentIdentity = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) return false;
      const result = await syncIdentity(data.session.access_token);
      if (!result.success || typeof result.token !== "string") return false;
      applyAccess(result);
      return true;
    } catch {
      return false;
    }
  }, [applyAccess]);

  const refreshProfile = useCallback(async () => {
    if (getAccessToken()) {
      const data = await callAccessApi({ action: "session" });
      if (data.success) {
        if (data.fullName === "Cliente Magnetize") {
          const restored = await syncCurrentIdentity();
          if (restored) return;
        }
        applyAccess(data);
        return;
      }
      // A failed network request is not proof that the session expired.
      if (data.statusCode !== 401 && data.statusCode !== 404) {
        setIsLoading(false);
        return;
      }
      clearAccess();
    }
    const restored = await syncCurrentIdentity();
    if (!restored) setProfile(null);
    setIsLoading(false);
  }, [applyAccess, syncCurrentIdentity, clearAccess]);

  useEffect(() => {
    const cached = localStorage.getItem(PROFILE_KEY);
    if (cached && getAccessToken()) {
      try {
        setProfile(JSON.parse(cached) as UserProfile);
      } catch {
        localStorage.removeItem(PROFILE_KEY);
      }
    }
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const onProfileChanged = (event: Event) => {
      setProfile((event as CustomEvent<UserProfile | null>).detail);
      setIsLoading(false);
    };
    window.addEventListener(PROFILE_EVENT, onProfileChanged);
    return () => window.removeEventListener(PROFILE_EVENT, onProfileChanged);
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.access_token || !["SIGNED_IN", "INITIAL_SESSION", "TOKEN_REFRESHED"].includes(event)) {
        return;
      }

      const pendingOAuth = localStorage.getItem(OAUTH_PENDING_KEY) === "1";

      if (event === "INITIAL_SESSION" && getAccessToken() && !pendingOAuth) {
        return;
      }

      void syncIdentity(session.access_token)
        .then((result) => {
          if (!result.success || typeof result.token !== "string") return;

          applyAccess(result);
          hideAuthOverlay();

          // O evento SIGNED_IN também ocorre em logins comuns e na
          // restauração de sessões. Só notificamos quando houver um OAuth
          // iniciado pelo usuário e ainda pendente.
          // Conferimos a flag DEPOIS do await para que apenas um listener
          // possa consumi-la, mesmo com vários useAuth montados.
          if (localStorage.getItem(OAUTH_PENDING_KEY) === "1") {
            localStorage.removeItem(OAUTH_PENDING_KEY);
            toast.success("Conta criada, continue gerando", {
              id: "account-created",
              description: "Continue com o vídeo escolhido ou escolha outro na galeria.",
              duration: 4000,
            });

            if (window.location.pathname !== "/dashboard") {
              window.dispatchEvent(
                new CustomEvent("magnetize:navigate", {
                  detail: typeof window.history.state?.usr?.returnTo === "string" && window.history.state.usr.returnTo.startsWith("/checkout?")
                    ? window.history.state.usr.returnTo : "/dashboard",
                }),
              );
            }
          }
        })
        .catch((error) => {
          console.error("Erro ao sincronizar autenticação:", error);
        });
    });

    return () => data.subscription.unsubscribe();
  }, [applyAccess]);

  useEffect(() => {
    if (!profile) return;
    const timer = window.setInterval(() => void refreshProfile(), 10000);
    const onFocus = () => void refreshProfile();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [profile?.id, refreshProfile]);

  const signup = async (fullName: string, email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: fullName.trim() } },
    });
    if (error) return { error: { message: friendlyAuthError(error.message) } };
    if (!data.session) return { error: null, needsEmailConfirmation: true };
    const result = await syncIdentity(data.session.access_token);
    if (!result.success || typeof result.token !== "string")
      return { error: { message: String(result.error || "Erro ao criar conta.") } };
    applyAccess(result);
    return { error: null };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.session)
      return { error: { message: friendlyAuthError(error?.message || "E-mail ou senha incorretos.") } };
    const result = await syncIdentity(data.session.access_token);
    if (!result.success || typeof result.token !== "string")
      return { error: { message: String(result.error || "Erro ao entrar.") } };
    applyAccess(result);
    return { error: null };
  };

  const signInWithProvider = async (provider: "google" | "apple"): Promise<AuthResult> => {
    try {
      localStorage.setItem(OAUTH_PENDING_KEY, "1");
      showAuthOverlay();
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
        extraParams: provider === "google" ? { hl: "pt-BR", prompt: "select_account" } : { locale: "pt_BR" },
      });
      if (result.error) {
        hideAuthOverlay();
        localStorage.removeItem(OAUTH_PENDING_KEY);
        return { error: { message: friendlyAuthError(result.error.message) } };
      }
      if (result.redirected) return { error: null, redirected: true };
      const synced = await syncCurrentIdentity();
      hideAuthOverlay();
      localStorage.removeItem(OAUTH_PENDING_KEY);
      return synced ? { error: null } : { error: { message: "Não foi possível concluir a entrada." } };
    } catch {
      hideAuthOverlay();
      localStorage.removeItem(OAUTH_PENDING_KEY);
      return { error: { message: "Não foi possível concluir a entrada." } };
    }
  };

  const signOut = async () => {
    if (getAccessToken()) await callAccessApi({ action: "logout" });
    await supabase.auth.signOut();
    clearAccess();
  };

  const deleteAccount = async (pixTransactionId: string) => {
    const data = await callAccessApi({ action: "delete", pixTransactionId });
    if (!data.success) return { error: { message: String(data.error || "Erro ao apagar conta.") } };
    await supabase.auth.signOut();
    clearAccess();
    return { error: null };
  };

  return {
    profile,
    isLoading,
    isAuthenticated: Boolean(profile),
    signup,
    login,
    signInWithProvider,
    deleteAccount,
    signOut,
    refreshProfile,
  };
};
