# MessagePack DevTools

A Chrome DevTools extension for intercepting, decoding, and inspecting **MessagePack (msgpack)** network responses.

Built with **Manifest V3**, **React 19**, **TypeScript**, **Vite 8**, and **Tailwind CSS 4**.

## Features

- Intercepts finished network requests via `chrome.devtools.network.onRequestFinished`
- Filters responses whose `Content-Type` is `application/x-msgpack` or `application/msgpack`
- Decodes binary MessagePack bodies (`base64` → `Uint8Array` → `msgpack.decode`)
- Two-column layout: request list on the left, decoded JSON on the right
- JSON tree viewer with collapsible nodes
- One-click **Clear** button to reset captured requests
- Dark, Chrome Network-tab-inspired UI

## Prerequisites

- Node.js (any recent LTS release)
- npm or pnpm
- Chrome / Chromium (for loading the unpacked extension)

## Installation

Install all dependencies at their latest versions:

```bash
npm install --include=dev
```

> The `--include=dev` flag ensures dev dependencies are installed even if your
> global npm config has `omit=dev` enabled.

## Build

```bash
npm run build
```

The production build is written to the `dist/` directory:

```
dist/
├── manifest.json
├── devtools.html
├── devtools.js
├── panel.html
├── panel.js
├── assets/
│   └── panel.css
└── chunks/
    └── ...
```

## Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist/` folder of this project.
5. The **MessagePack DevTools** extension should now appear in your list.

## How to Use

1. Open any website in a tab (or reload an existing tab).
2. Open Chrome DevTools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
3. Click the **MsgPack** tab at the top of DevTools.
4. Trigger requests that return MessagePack responses (Content-Type
   `application/x-msgpack` or `application/msgpack`).
5. Captured requests appear in the left column. Each row shows the status code,
   HTTP method, URL, response time, and size.
6. Click a request to view its decoded JSON payload in the right column.
7. Click **Clear** to remove all captured requests.

### Notes

- Only responses whose `Content-Type` header includes `application/x-msgpack`
  or `application/msgpack` are processed.
- The extension must be reloaded after rebuilding if you have already loaded
  it as an unpacked extension. On `chrome://extensions`, click the refresh icon
  on the extension card.
- If a response cannot be decoded, the request is still captured and an error
  is shown in the detail panel.

## Development

Start the Vite dev server:

```bash
npm run dev
```

Run a TypeScript type check without emitting:

```bash
npm run typecheck
```

## Project Structure

```
msg-devtool/
├── public/
│   └── manifest.json      # Manifest V3 config
├── src/
│   ├── devtools.ts        # Creates the DevTools panel
│   ├── panel.tsx          # React app: capture + decode + UI
│   └── index.css          # Tailwind CSS v4 entry
├── devtools.html          # DevTools page entry point
├── panel.html             # Panel page entry point
├── vite.config.ts         # Multi-entry, no-hash build config
├── tsconfig.json
└── package.json
```

## Tech Stack

| Package              | Purpose                          |
| -------------------- | -------------------------------- |
| `react` / `react-dom` | UI framework                    |
| `typescript`         | Type safety                      |
| `vite`               | Build tool and dev server        |
| `tailwindcss`        | Utility-first styling            |
| `@tailwindcss/vite`  | Tailwind CSS v4 Vite integration |
| `@msgpack/msgpack`   | MessagePack decode/encode        |
| `@uiw/react-json-view` | JSON tree viewer               |
| `lucide-react`       | UI icons                         |
| `@types/chrome`      | Chrome API TypeScript types      |
