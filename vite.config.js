import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get the hostname from the error message
const REPLIT_HOST =
  "5c9ce84a-949c-462c-b582-1d949f2209a0-00-34tv1tyh493iv.worf.replit.dev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pool-league-analyzer/', // Your repository name
  server: {
    host: true, // Listen on all addresses
    allowedHosts: [
      "localhost",
      ".replit.dev",
      REPLIT_HOST,
      // Add any other hostnames you might access the app from
    ],
  },
});