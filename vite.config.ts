import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
    const missing = required.filter((name) => !env[name]?.trim());
    if (missing.length) {
      throw new Error(`Configure as variáveis de ambiente antes do build: ${missing.join(", ")}`);
    }
    const url = new URL(env.VITE_SUPABASE_URL);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("VITE_SUPABASE_URL deve ser uma URL HTTP ou HTTPS válida.");
    }
  }
  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});
