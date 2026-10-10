const STORAGE_KEY = "msg-devtool.content-types";

export function parseContentTypes(raw: string): string[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
}

export function loadCustomContentTypes(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseContentTypes(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomContentTypes(types: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, types.join(", "));
  } catch {
    // localStorage may be unavailable; settings just won't persist.
  }
}
