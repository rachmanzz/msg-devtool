import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeMsgpackBody, isMsgPackContentType } from "../lib/decode";
import { filterCaptures } from "../lib/filter";
import { loadCustomContentTypes, saveCustomContentTypes } from "../lib/settings";
import { extensionApi, getResponseContent } from "../lib/browser";
import type { Capture } from "../lib/types";

const STORAGE_KEY = "msg-devtool.captures";
const MAX_PERSISTED_CAPTURES = 200;

interface PersistedState {
  captures: Capture[];
  nextId: number;
  selectedId: number | null;
}

export function useCaptures() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [customContentTypes, setCustomContentTypes] = useState<string[]>(() =>
    loadCustomContentTypes(),
  );
  const idRef = useRef(0);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    extensionApi.storage.session
      .get(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        const state = stored[STORAGE_KEY] as PersistedState | undefined;
        if (state) {
          setCaptures(state.captures);
          setSelectedId(state.selectedId);
          idRef.current = state.nextId;
        }
        hydratedRef.current = true;
      })
      .catch(() => {
        hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const state: PersistedState = {
      captures: captures.slice(0, MAX_PERSISTED_CAPTURES),
      nextId: idRef.current,
      selectedId,
    };
    extensionApi.storage.session.set({ [STORAGE_KEY]: state }).catch(() => {});
  }, [captures, selectedId]);

  useEffect(() => {
    const listener = (request: chrome.devtools.network.Request) => {
      const contentType =
        request.response.headers.find(
          (header) => header.name.toLowerCase() === "content-type",
        )?.value ?? "";

      if (!isMsgPackContentType(contentType, customContentTypes)) return;

      void getResponseContent(request).then(({ content, encoding }) => {
        const result = decodeMsgpackBody(content, encoding);
        const id = ++idRef.current;
        const capture: Capture = {
          id,
          url: request.request.url,
          method: request.request.method,
          status: request.response.status,
          statusText: request.response.statusText,
          decoded: result.ok ? result.decoded : null,
          error: result.ok ? undefined : result.error,
          size: result.byteLength,
          time: request.startedDateTime
            ? new Date(request.startedDateTime).getTime()
            : Date.now(),
          duration: request.time,
        };
        setCaptures((prev) => [capture, ...prev].slice(0, MAX_PERSISTED_CAPTURES));
        setSelectedId((current) => current ?? id);
      });
    };

    extensionApi.devtools.network.onRequestFinished.addListener(listener);
    return () => {
      extensionApi.devtools.network.onRequestFinished.removeListener(listener);
    };
  }, [customContentTypes]);

  const updateCustomContentTypes = useCallback((types: string[]) => {
    setCustomContentTypes(types);
    saveCustomContentTypes(types);
  }, []);

  const clearCaptures = useCallback(() => {
    setCaptures([]);
    setSelectedId(null);
  }, []);

  const selected = useMemo(
    () => captures.find((capture) => capture.id === selectedId) ?? null,
    [captures, selectedId],
  );

  const filteredCaptures = useMemo(
    () => filterCaptures(captures, query),
    [captures, query],
  );

  return {
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
  };
}
