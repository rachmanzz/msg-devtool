# Chrome Web Store listing — MessagePack DevTools

Ready-to-paste content for the Chrome Web Store developer dashboard.
Everything here matches `manifests/chrome.json` (v0.1.0).

## Store listing

**Name** (max 75 chars)

```
MessagePack DevTools
```

**Short description** (max 132 chars)

```
Decode and inspect MessagePack (msgpack) network responses right inside Chrome DevTools, as a readable JSON tree.
```

**Category**

```
Developer Tools
```

**Language**

```
English
```

**Detailed description**

```
MessagePack DevTools adds a "MsgPack" panel to Chrome DevTools so you can read
the MessagePack (msgpack) responses flowing through your app instead of staring
at an unreadable binary blob.

WHAT IT DOES
• Intercepts finished network requests and detects msgpack responses by their
  Content-Type.
• Decodes binary MessagePack bodies into a collapsible JSON tree.
• Shows status code, method, URL, timestamp, duration and size for every
  captured request.

KEY FEATURES
• Live filter by URL, method or status code.
• Copy the decoded payload as JSON, or export it as .json or re-encoded
  .msgpack.
• Configurable Content-Types for APIs that use a custom msgpack media type.
• Captures persist across panel reloads within the same browser session
  (max 200 entries).
• One-click Clear.
• Clean, dark, Network-tab-inspired UI.

HOW TO USE
1. Open a page in Chrome and open DevTools (F12).
2. Select the "MsgPack" tab.
3. Trigger a request that returns msgpack; it appears in the list.
4. Click it to inspect the decoded JSON, then copy or export.

PRIVACY
Everything runs locally in your browser. The extension does not collect,
store or transmit any of your data. See the privacy section below.

Also available for Firefox (WebExtensions).
```

**Store icon**: `store/store-icon-128.png` (128×128)
**Small promo tile** (optional): `store/promo-tile-440x280.png` (440×280)
**Marquee promo tile** (optional): `store/marquee-1400x560.png` (1400×560)
**Screenshots** (1–5 required; 1280×800 or 640×400): see "Screenshots" below.

## Screenshots

The dashboard requires at least one real screenshot. Capture them locally:

1. Load the unpacked extension from `dist/` (see README).
2. Open a page that returns a MessagePack response (or a demo).
3. Open DevTools → **MsgPack** tab, select a captured request.
4. Take a full-window screenshot and crop to **1280×800** (or 640×400).
5. Upload 1–5 images. Suggested shots:
   - The decoded JSON tree for a request.
   - The list with several captures and the filter in use.
   - The detail pane showing Copy JSON / export actions.

## Privacy practices (dashboard questions)

- **Single purpose**: "Decode and display MessagePack (msgpack) network
  responses inside Chrome DevTools."
- **Data usage**: The extension does **not** collect or transmit any user data.
  Select "This item does not collect user data" for every category
  (personally identifiable info, health, financial, authentication,
  personal communications, location, web history, user activity, website
  content).
- **Privacy policy URL**: not required, since no data is collected.
- **Remote code**: No. The extension ships all of its code in the package and
  does not fetch or evaluate remote code.

## Permission justification

The manifest only requests one permission:

- **`storage`** — used to persist the captured request list (`storage.session`)
  so the panel keeps its captures when DevTools is reloaded. No host
  permissions are requested: the DevTools Network API exposes the inspected
  tab's requests without them.

## Versioning / automated releases

The first submission must be uploaded manually through this dashboard. Once the
item exists, copy its **Extension ID** and configure the repository secrets
(`CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`)
so the release workflow publishes future tags automatically.
