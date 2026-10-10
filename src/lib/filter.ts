import type { Capture } from "./types";

export function filterCaptures(captures: readonly Capture[], query: string): Capture[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return [...captures];
  return captures.filter(
    (capture) =>
      capture.url.toLowerCase().includes(trimmed) ||
      capture.method.toLowerCase().includes(trimmed) ||
      String(capture.status).includes(trimmed) ||
      (capture.error?.toLowerCase().includes(trimmed) ?? false),
  );
}
