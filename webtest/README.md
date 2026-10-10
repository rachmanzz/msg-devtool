# webtest — MessagePack demo server

A tiny, zero-dependency web app that returns **MessagePack** responses, used to
test and screenshot the [MessagePack DevTools](../) extension.

It runs with **Node.js** or **Bun** and needs no `npm install`.

## Run

```bash
# with Node
node server.mjs

# or with Bun
bun server.mjs
```

Then open <http://localhost:4000>.

- Change the port with `PORT=5000 node server.mjs`.
- The page decodes each MessagePack response live, so the shapes you see are
  real. It also fires a couple of requests automatically on load.

## Endpoints

| Endpoint        | Content-Type            | Captured by extension |
| --------------- | ----------------------- | --------------------- |
| `/api/users`    | `application/x-msgpack` | yes                   |
| `/api/products` | `application/x-msgpack` | yes                   |
| `/api/orders`   | `application/x-msgpack` | yes                   |
| `/api/config`   | `application/x-msgpack` | yes                   |
| `/api/stats`    | `application/x-msgpack` | yes                   |
| `/api/heavy`    | `application/x-msgpack` | yes                   |
| `/api/plain`    | `text/plain`            | no (control)          |
| `/api/json`     | `application/json`      | no (control)          |

## Taking screenshots for the Chrome Web Store

1. Build and load the extension: `npm run build:chrome` at the repo root, then
   load the `dist/` folder via `chrome://extensions` → **Load unpacked**.
2. Start this server (`node server.mjs`) and open <http://localhost:4000>.
3. Open DevTools (`F12`) and select the **MsgPack** tab, then **dock it to the
   right** or bottom so both the page and the panel are visible.
4. Click **Fire all requests** (or reload the page) so several requests are
   captured. Select one to show the decoded JSON tree.
5. Resize the browser window, take a screenshot, and crop to **1280×800**
   (or 640×400). Upload 1–5 images to the Chrome Web Store listing.

Suggested shots: (a) decoded JSON tree for an order, (b) the request list with
the filter in use, (c) the detail pane with Copy JSON / export buttons.
