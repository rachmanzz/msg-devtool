import { Search, Settings, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseContentTypes } from "../lib/settings";

interface ToolbarProps {
  capturedCount: number;
  filteredCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  customContentTypes: string[];
  onCustomContentTypesChange: (types: string[]) => void;
}

export function Toolbar({
  capturedCount,
  filteredCount,
  query,
  onQueryChange,
  onClear,
  customContentTypes,
  onCustomContentTypesChange,
}: ToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(customContentTypes.join(", "));
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [settingsOpen]);

  return (
    <header className="relative flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
      <span className="text-sm font-semibold tracking-wide text-slate-100">
        MessagePack Inspector
      </span>

      <div className="relative ml-4 w-72 max-w-full">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Filter by URL, method, or status…"
          className="w-full rounded-md border border-slate-700 bg-slate-900 py-1.5 pr-7 pl-8 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-600"
        />
        {query !== "" && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-200"
            aria-label="Clear filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-400">
          {query.trim() === ""
            ? `${capturedCount} captured`
            : `${filteredCount} of ${capturedCount} captured`}
        </span>

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => {
              setDraft(customContentTypes.join(", "));
              setSettingsOpen((open) => !open);
            }}
            className={`rounded-md border px-2.5 py-1.5 transition ${
              settingsOpen
                ? "border-slate-500 text-slate-100"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100"
            }`}
            aria-label="Content-Type settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {settingsOpen && (
            <div className="absolute top-full right-0 z-20 mt-1 w-80 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl shadow-black/40">
              <p className="text-xs font-semibold text-slate-200">
                Custom Content-Type matches
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Comma-separated list matched (substring, case-insensitive) against the
                response Content-Type. Defaults like{" "}
                <code className="text-slate-400">application/x-msgpack</code> always
                apply.
              </p>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder="application/vnd.mycompany.msgpack"
                className="mt-2 w-full resize-none rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-600"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCustomContentTypesChange(parseContentTypes(draft));
                    setSettingsOpen(false);
                  }}
                  className="rounded-md border border-cyan-700 bg-cyan-900/40 px-2.5 py-1 text-xs font-medium text-cyan-200 hover:border-cyan-500"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </header>
  );
}
