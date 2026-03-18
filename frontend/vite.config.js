import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certDir = path.join(__dirname, ".cert");
const certPath = path.join(certDir, "cert.pem");
const keyPath = path.join(certDir, "key.pem");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const authServiceUrl = env.VITE_AUTH_SERVICE_URL;
  const proxyTarget = authServiceUrl ? new URL(authServiceUrl).origin : "http://127.0.0.1:5000";
  const hasHttpsCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      https: hasHttpsCert
        ? {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
          }
        : undefined,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
