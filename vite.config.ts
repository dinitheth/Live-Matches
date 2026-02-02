import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/pandascore': {
        target: 'https://api.pandascore.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pandascore/, ''),
        headers: {
          'Authorization': 'Bearer QlP9wl3Oh5Zl97LiUyFy7HSQ1L4NIZ0McJMYoXf904QIJGoE0bk',
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
