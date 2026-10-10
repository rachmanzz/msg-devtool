import { CaptureDetail } from "./CaptureDetail";
import { CaptureList } from "./CaptureList";
import { Toolbar } from "./Toolbar";
import { useCaptures } from "../hooks/useCaptures";

export function App() {
  const {
    captures,
    filteredCaptures,
    selected,
    selectedId,
    setSelectedId,
    query,
    setQuery,
    clearCaptures,
    customContentTypes,
    updateCustomContentTypes,
  } = useCaptures();

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-200">
      <Toolbar
        capturedCount={captures.length}
        filteredCount={filteredCaptures.length}
        query={query}
        onQueryChange={setQuery}
        onClear={clearCaptures}
        customContentTypes={customContentTypes}
        onCustomContentTypesChange={updateCustomContentTypes}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-800">
          <CaptureList
            captures={filteredCaptures}
            hasQuery={query.trim() !== ""}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4">
          <CaptureDetail capture={selected} />
        </main>
      </div>
    </div>
  );
}
