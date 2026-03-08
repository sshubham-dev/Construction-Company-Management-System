import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mdx from "@mdx-js/rollup";
import { visualizer } from "rollup-plugin-visualizer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    server: {
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      { enforce: "pre", ...mdx() },
      react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
      ViteImageOptimizer(),
      // Only open visualizer in production build to analyze bundle size
      visualizer({ 
        open: isProd,
        filename: "bundle-report.html" 
      }), 
      VitePWA({
        registerType: "autoUpdate",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.js",
        injectRegister: "auto",
        manifest: {
          name: "Bhuvi Manager",
          short_name: "BhuviManager",
          description: "Construction Company Management System (CCMS)",
          start_url: "/",
          display: "standalone",
          background_color: "#eeffda",
          theme_color: "#a2ee46",
          icons: [
            { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
            { src: "maskable-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        injectManifest: {
          // This ensures your 4.4MB+ file actually gets cached
          maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, 
        },
        // Fallback for general Workbox settings
        workbox: {
          maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
        },
        devOptions: {
          enabled: true, // Allows testing PWA in dev mode
          type: 'module',
        },
      }),
    ],
    build: {
      minify: "terser", // Terser often produces smaller bundles than esbuild for large projects
      terserOptions: {
        compress: {
          drop_console: isProd, // Removes console.logs in production
          drop_debugger: isProd,
        },
      },
      target: "modules",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000, 
      rollupOptions: {
        output: {
          // CRITICAL: This splits your 4.4MB file into manageable pieces
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-core";
              if (id.includes("lodash")) return "vendor-utils";
              if (id.includes("@mui") || id.includes("@emotion")) return "vendor-ui";
              if (id.includes("chart.js") || id.includes("recharts")) return "vendor-charts";
              if (id.includes("axios") || id.includes("query")) return "vendor-network";
              return "vendor-others";
            }
          },
        },
      },
    },
  };
});