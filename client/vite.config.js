import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mdx from "@mdx-js/rollup";
import { visualizer } from "rollup-plugin-visualizer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    { enforce: "pre", ...mdx() },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    ViteImageOptimizer(),
    visualizer({ open: true }), // opens report after build,
    VitePWA({
      maximumFileSizeToCacheInBytes: 5000000, // Set to 3 MiB
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "maskable-icon.png",
        "logo.png",
      ],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Bhuvi Manager",
        short_name: "BhuviManager",
        description:
          "The Construction Company Management System (CCMS) is a professional-grade software designed for real-world application in the construction industry. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers comprehensive tools to manage construction projects, streamline workflows, and ensure operational efficiency.",
        start_url: "/",
        display: "standalone",
        background_color: "#eeffda",
        theme_color: "#a2ee46",
        icons: [
          {
            src: "icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "icons/icon-167x167.png",
            sizes: "167x167",
            type: "image/png",
          },
          {
            src: "icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "icons/icon-120x120.png",
            sizes: "120x120",
            type: "image/png",
          },
          {
            src: "icons/icon-76x76.png",
            sizes: "76x76",
            type: "image/png",
          },
          {
            src: "icons/icon-70x70.png",
            sizes: "70x70",
            type: "image/png",
          },
          {
            src: "icons/icon-150x150.png",
            sizes: "150x150",
            type: "image/png",
          },
          {
            src: "icons/icon-310x310.png",
            sizes: "310x310",
            type: "image/png",
          },
          {
            src: "maskable-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        splash_screens: [
          {
            src: "splash/splash-1125x2436.png",
            sizes: "1125x2436",
            type: "image/png",
          },
          {
            src: "splash/splash-750x1334.png",
            sizes: "750x1334",
            type: "image/png",
          },
          {
            src: "splash/splash-1242x2208.png",
            sizes: "1242x2208",
            type: "image/png",
          },
          {
            src: "splash/splash-1668x2224.png",
            sizes: "1668x2224",
            type: "image/png",
          },
          {
            src: "splash/splash-2048x2732.png",
            sizes: "2048x2732",
            type: "image/png",
          },
          {
            src: "splash/splash-1536x2048.png",
            sizes: "1536x2048",
            type: "image/png",
          },
          {
            src: "splash/splash-320x426.png",
            sizes: "320x426",
            type: "image/png",
          },
          {
            src: "splash/splash-320x470.png",
            sizes: "320x470",
            type: "image/png",
          },
          {
            src: "splash/splash-480x640.png",
            sizes: "480x640",
            type: "image/png",
          },
          {
            src: "splash/splash-720x960.png",
            sizes: "720x960",
            type: "image/png",
          },
          {
            src: "splash/splash-960x1280.png",
            sizes: "960x1280",
            type: "image/png",
          },
          {
            src: "splash/splash-1280x1920.png",
            sizes: "1280x1920",
            type: "image/png",
          },
        ],
        orientation: "portrait",
        scope: "/",
        lang: "en",
      },
    }),
  ],
  build: {
    minify: "esbuild",
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 4000, // Adjust as needed
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/lodash")) {
            return "lodash"; // Group lodash-related modules into a 'lodash' chunk
          }
        },
      },
    },
  },
});
