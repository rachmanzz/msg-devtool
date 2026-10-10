/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MANIFEST_DIR = resolve(import.meta.dirname, "manifests");
const pkg = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "package.json"), "utf8"),
) as { version: string };

/**
 * Extension stores only accept up to four dot-separated integers, so
 * `1.2.3-beta.1` becomes `1.2.3`.
 */
function toExtensionVersion(version: string): string {
  const parts = (version.split("-")[0] ?? "")
    .split(".")
    .filter((part) => /^\d+$/.test(part));
  return parts.length > 0 ? parts.slice(0, 4).join(".") : "0.0.0";
}

/**
 * Emits the correct `manifest.json` for the build target, injecting the version
 * from `package.json`. Use `vite build --mode firefox` for a Firefox bundle.
 */
function manifestPlugin(target: "chrome" | "firefox", outDir: string) {
  return {
    name: "msg-devtool-manifest",
    closeBundle() {
      const manifest = JSON.parse(
        readFileSync(resolve(MANIFEST_DIR, `${target}.json`), "utf8"),
      ) as Record<string, unknown>;
      manifest.version = toExtensionVersion(pkg.version);

      const directory = resolve(import.meta.dirname, outDir);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        resolve(directory, "manifest.json"),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
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
