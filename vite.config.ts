import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@apis": path.resolve(__dirname, "./src/apis"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  // server: {
  //   host: '0.0.0.0',
  //   port: 8080,
  //   hmr: true,
  // }
  server: {
    host: true,
    allowedHosts: [
      'www.aunyapoolvilla.com',
      'aunyapoolvilla.com'
    ],
    hmr: {
      host: 'aunyapoolvilla.com',
      protocol: 'wss'
    }
  }
})