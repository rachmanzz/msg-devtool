/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const MANIFEST_DIR = resolve(import.meta.dirname, "manifests");

/**
 * Emits the correct `manifest.json` for the build target. Use
 * `vite build --mode firefox` to produce a Firefox bundle.
 */
function manifestPlugin(target: "chrome" | "firefox", outDir: string) {
  return {
    name: "msg-devtool-manifest",
    closeBundle() {
      const source = resolve(MANIFEST_DIR, `${target}.json`);
      const destination = resolve(import.meta.dirname, outDir, "manifest.json");
      if (!existsSync(destination)) {
        mkdirSync(resolve(import.meta.dirname, outDir), { recursive: true });
      }
      copyFileSync(source, destination);
    },
  };
}

export default defineConfig(({ mode }) => {
  const target = mode === "firefox" ? "firefox" : "chrome";
  const outDir = target === "firefox" ? "dist-firefox" : "dist";

  return {
    plugins: [react(), tailwindcss(), manifestPlugin(target, outDir)],
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          devtools: resolve(import.meta.dirname, "devtools.html"),
          panel: resolve(import.meta.dirname, "panel.html"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name].js",
          assetFileNames: "assets/[name][extname]",
        },
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
