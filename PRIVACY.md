# Privacy Policy — MessagePack DevTools

_Last updated: October 10, 2026_

MessagePack DevTools is a developer tool that decodes and displays MessagePack
(msgpack) network responses inside a Chrome DevTools panel. It is designed to run
entirely on your device.

## Summary

- Does **not** collect, transmit, sell, or share your data.
- No servers, no analytics, no telemetry, no third-party services.
- Anything it reads stays in your browser and is cleared when the browser session
  ends.

## What the extension accesses and why

- **Network responses of the tab you inspect.** While the Chrome DevTools window
  is open and the "MsgPack" panel is active, the extension reads the network
  responses of the inspected page (URL, method, status, timing, headers, body)
  using the Chrome DevTools Network API, so it can detect and decode MessagePack
  payloads and display them as JSON.
- **Local session storage.** Decoded results and request metadata are kept only in
  the browser's `chrome.storage.session` (up to 200 entries) so the panel can
  restore them when DevTools is reopened during the same browser session. This
  data is cleared when the browser session ends.

## What the extension does NOT do

- It does not transmit any data off your device.
- It does not sell or share data with anyone.
- It does not read your browsing history, cookies, bookmarks, passwords, or any
  other browser data.
- It requests no host permissions and injects no content scripts.

## Data retention and control

Captured data lives only in memory / session storage and is removed when the
browser session ends or when you click **Clear**.

## Limited Use

MessagePack DevTools' use of information complies with the Chrome Web Store User
Data Policy, including the Limited Use requirements.

## Changes

If this policy changes, the updated version will be posted at this URL with a new
"Last updated" date.

## Contact

For questions about this policy, open an issue at
<https://github.com/rachmanzz/msg-devtool/issues>.
