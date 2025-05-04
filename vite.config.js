import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nzonzonzonzo/pool-league-analyzer/', // Replace with your actual GitHub repository name
})

// Get the hostname from the error message
const REPLIT_HOST =
  "5c9ce84a-949c-462c-b582-1d949f2209a0-00-34tv1tyh493iv.worf.replit.dev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
