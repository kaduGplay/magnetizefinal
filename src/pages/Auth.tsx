import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginCodeModal from "@/components/LoginCodeModal";
import CreateAccountModal from "@/components/CreateAccountModal";
import ModalPageTracker from "@/components/ModalPageTracker";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedReturn = location.state?.returnTo;
  const returnTo = typeof requestedReturn === "string" && requestedReturn.startsWith("/checkout?") ? requestedReturn : "/dashboard";
  const { profile, isLoading } = useAuth();
  const completed = useRef(false);
  const finish = () => { completed.current = true; navigate(returnTo, { replace: true }); };
  const close = () => { if (!completed.current) navigate("/"); };
  const [showLogin, setShowLogin] = useState(true);
  useEffect(() => { if (!isLoading && profile) navigate(returnTo, { replace: true }); }, [profile, isLoading, navigate, returnTo]);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div className="min-h-screen bg-background">
      <ModalPageTracker isOpen path={showLogin ? "/auth/entrar" : "/auth/criar-conta"} basePath="/auth" />
      <LoginCodeModal navigateOnSuccess={false} isOpen={showLogin} onSuccess={finish} onClose={close} onCreateNew={() => setShowLogin(false)} />
      <CreateAccountModal navigateOnSuccess={false} isOpen={!showLogin} onSuccess={finish} onClose={close} onOpenLogin={() => setShowLogin(true)} />
    </div>
  );
};

export default Auth;