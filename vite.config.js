import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  // server: {
  //   proxy: {
  //     "/api": "https://bug-buster-server.vercel.app",
  //   },
  // },
  plugins: [tailwindcss(), react()],
});
