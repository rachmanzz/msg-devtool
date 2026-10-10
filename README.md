# MessagePack DevTools

A Chrome DevTools extension for intercepting, decoding, and inspecting **MessagePack (msgpack)** network responses.

Built with **Manifest V3**, **React 19**, **TypeScript**, **Vite 8**, and **Tailwind CSS 4**.

## Features

- Intercepts finished network requests via `chrome.devtools.network.onRequestFinished`
- Filters responses by Content-Type (`application/x-msgpack`, `application/msgpack`, `application/vnd.msgpack`, plus **custom configurable types**)
- Decodes binary MessagePack bodies (`base64` → `Uint8Array` → `msgpack.decode`)
- Two-column layout: request list on the left, decoded JSON on the right
- **Live filter** by URL, method, or status code
- **Copy JSON** to clipboard, **export** decoded payload as `.json` or re-encoded `.msgpack`
- JSON tree viewer with collapsible nodes
- Requests **persist across panel reloads** (session storage, capped at 200 entries)
- One-click **Clear** to reset captured requests
- Dark, Chrome Network-tab-inspired UI

## Prerequisites

- Node.js (any recent LTS release)
- npm
- Chrome / Chromium (for loading the unpacked extension)

## Installation

```bash
npm install
```

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
4. Trigger requests that return MessagePack responses.
5. Captured requests appear in the left column. Each row shows the status code,
   HTTP method, URL, timestamp, duration, and size.
6. Click a request to view its decoded JSON payload in the right column.
7. Use the toolbar to **filter** captures, configure **custom Content-Types**
   (gear icon), or **Clear** all captures.
8. In the detail pane, use **Copy JSON**, or export as `.json` / `.msgpack`.

### Notes

- Captures survive DevTools panel reloads within the same browser session
  (stored via `chrome.storage.session`, max 200 entries).
- The extension must be reloaded after rebuilding if you have already loaded
  it as an unpacked extension. On `chrome://extensions`, click the refresh icon
  on the extension card.
- If a response cannot be decoded, the request is still captured and an error
  is shown in the detail panel.

## Development

```bash
npm run dev           # Vite dev server
npm run typecheck     # TypeScript type check (no emit)
npm run lint          # ESLint
npm run lint:fix      # ESLint with autofix
npm run format        # Prettier write
npm run format:check  # Prettier check
npm test              # Vitest unit tests (run once)
npm run test:watch    # Vitest watch mode
```

## Continuous Integration

Every push and pull request to `main` runs **GitHub Actions**
(`.github/workflows/ci.yml`): lint → format check → typecheck → test → build,
on a matrix of **Node 22 and 24**. The built extension is uploaded as a workflow
artifact (`msgpack-devtools-dist`), so you can download and load it without
building locally.

### Release

Pushing a version tag (e.g. `git tag v0.1.0 && git push origin v0.1.0`) runs
`.github/workflows/release.yml`: it re-runs the full verification suite, builds
the extension, packages `dist/` into a `.zip`, and creates a GitHub Release with
the archive attached.

If the Chrome Web Store secrets (`CWS_EXTENSION_ID`, `CWS_CLIENT_ID`,
`CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`) are configured, the same workflow also
uploads and auto-publishes the release to the Chrome Web Store. When the secrets
are absent, the publish step is skipped.

### Security

- **CodeQL** (`.github/workflows/codeql.yml`) analyzes the JavaScript/TypeScript
  sources on every push, pull request, and a weekly schedule.
- **Dependabot** (`.github/dependabot.yml`) opens weekly grouped update PRs for
  npm dependencies and GitHub Actions.

## Project Structure

```
msg-devtool/
├── public/
│   └── manifest.json          # Manifest V3 config
├── src/
│   ├── devtools.ts            # Creates the DevTools panel
│   ├── panel.tsx              # React entry point
│   ├── index.css              # Tailwind CSS v4 entry
│   ├── components/
│   │   ├── App.tsx            # Layout composition
│   │   ├── Toolbar.tsx        # Search, settings, clear
│   │   ├── CaptureList.tsx    # Left column: captured requests
│   │   └── CaptureDetail.tsx  # Right column: decoded JSON + export
│   ├── hooks/
│   │   └── useCaptures.ts     # Network listener + capture state
│   └── lib/
│       ├── decode.ts          # base64/bytes/msgpack pipeline (unit-tested)
│       ├── filter.ts          # URL/method/status filter (unit-tested)
│       ├── settings.ts        # Custom Content-Type persistence
│       ├── format.ts          # Human-readable size/duration/time
│       └── types.ts           # Shared Capture type
├── .github/
│   ├── dependabot.yml         # Weekly dependency update PRs
│   └── workflows/
│       ├── ci.yml             # CI: lint, typecheck, test, build (matrix)
│       ├── codeql.yml         # CodeQL security analysis
│       └── release.yml        # Tag-triggered release + CWS publish
├── devtools.html              # DevTools page entry point
├── panel.html                 # Panel page entry point
├── vite.config.ts             # Multi-entry build + vitest config
├── eslint.config.js           # Flat ESLint config
├── tsconfig.json
└── package.json
```

## Tech Stack

| Package                | Purpose                          |
| ---------------------- | -------------------------------- |
| `react` / `react-dom`  | UI framework                     |
| `typescript`           | Type safety                      |
| `vite`                 | Build tool and dev server        |
| `tailwindcss`          | Utility-first styling            |
| `@tailwindcss/vite`    | Tailwind CSS v4 Vite integration |
| `@msgpack/msgpack`     | MessagePack decode/encode        |
| `@uiw/react-json-view` | JSON tree viewer                 |
| `lucide-react`         | UI icons                         |
| `vitest`               | Unit tests                       |
| `eslint` / `prettier`  | Linting and formatting           |
| `@types/chrome`        | Chrome API TypeScript types      |

## License

MIT — see [LICENSE](LICENSE).
