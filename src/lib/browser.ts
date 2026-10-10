/**
 * Cross-browser compatibility layer.
 *
 * Chrome exposes the callback-based `chrome.*` namespace. Firefox exposes the
 * promise-based `browser.*` namespace and, for compatibility, `chrome.*` with
 * callbacks. We prefer `browser` when present so we always get promises, and
 * fall back to `chrome` otherwise.
 *
 * The trickiest difference is `devtools.network.Request.getContent()`:
 *   - Chrome resolves/callbacks with `(content, encoding)`, where `encoding`
 *     is `"base64"` for binary bodies.
 *   - Firefox resolves with `[content, mimeType]`; the second element is the
 *     response MIME type, not an encoding. Firefox base64-encodes non-text
 *     bodies internally, so binary msgpack payloads still arrive as base64.
 */

const globalRef = globalThis as unknown as {
  browser?: typeof chrome;
  chrome?: typeof chrome;
};

export const isFirefox =
  typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

export const extensionApi = (globalRef.browser ?? globalRef.chrome) as typeof chrome;

export interface ResponseContent {
  content: string;
  encoding: string;
}

/**
 * Firefox base64-encodes response bodies whose MIME type is not text. This
 * mirrors the (simplified) text-detection used by Firefox's network monitor.
 */
export function isTextMimeType(mimeType: string): boolean {
  const type = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (type === "") return true;
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "application/javascript" ||
    type === "application/ecmascript" ||
    type === "application/xml" ||
    type === "application/x-www-form-urlencoded" ||
    type.endsWith("+json") ||
    type.endsWith("+xml")
  );
}

/**
 * Normalizes the second argument of `getContent()` into Chrome's encoding
 * convention (`"base64"` for binary, `""` for text).
 */
export function resolveResponseEncoding(secondArg: string, firefox: boolean): string {
  if (!firefox) return secondArg;
  return isTextMimeType(secondArg) ? "" : "base64";
}

export function getResponseContent(
  request: chrome.devtools.network.Request,
): Promise<ResponseContent> {
  if (isFirefox) {
    const getContent = request.getContent as unknown as () => Promise<[string, string]>;
    return getContent.call(request).then(([content, mimeType]) => ({
      content,
      encoding: resolveResponseEncoding(mimeType, true),
    }));
  }

  return new Promise<ResponseContent>((resolve, reject) => {
    try {
      request.getContent((content, encoding) => resolve({ content, encoding }));
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export function createDevtoolsPanel(
  title: string,
  iconPath: string,
  pagePath: string,
): void {
  if (isFirefox) {
    const create = extensionApi.devtools.panels.create as unknown as (
      title: string,
      iconPath: string,
      pagePath: string,
    ) => Promise<unknown>;
    void create.call(extensionApi.devtools.panels, title, iconPath, pagePath);
    return;
  }

  extensionApi.devtools.panels.create(title, iconPath, pagePath, () => {
    // Panel created.
  });
}
