"use client";
import {
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

type SavedPreset<T> = {
  id: string;
  name: string;
  value: T;
};

type PresetLibraryProps<T> = {
  storageKey: string;
  currentValue: T;
  onLoad: (value: T) => void;
  title?: string;
  itemLabel?: string;
  canSave?: boolean;
  getPreview?: (value: T) => string;
};

const presetListeners = new Map<string, Set<() => void>>();

function subscribeToPresets(storageKey: string, listener: () => void) {
  const listeners = presetListeners.get(storageKey) ?? new Set();
  listeners.add(listener);
  presetListeners.set(storageKey, listeners);

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    if (listeners.size === 0) presetListeners.delete(storageKey);
  };
}

function getPresetSnapshot(storageKey: string): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function notifyPresetChange(storageKey: string) {
  presetListeners.get(storageKey)?.forEach((listener) => listener());
}

function isSavedPreset(value: unknown): value is SavedPreset<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "value" in value
  );
}

export function PresetLibrary<T>({
  storageKey,
  currentValue,
  onLoad,
  title = "Saved presets",
  itemLabel = "preset",
  canSave = true,
  getPreview,
}: PresetLibraryProps<T>) {
  const nameInputId = useId();
  const editNameInputId = useId();
  const serializedPresets = useSyncExternalStore(
    (listener) => subscribeToPresets(storageKey, listener),
    () => getPresetSnapshot(storageKey),
    () => "[]",
  );
  const presets = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(serializedPresets);
      return Array.isArray(parsed)
        ? (parsed.filter(isSavedPreset) as SavedPreset<T>[])
        : [];
    } catch {
      return [];
    }
  }, [serializedPresets]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const savePresets = (next: SavedPreset<T>[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      notifyPresetChange(storageKey);
      setError("");
    } catch {
      setError("Presets could not be saved in this browser.");
    }
  };

  const savePreset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !canSave) return;

    savePresets([
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: trimmedName,
        value: currentValue,
      },
      ...presets,
    ]);
    setName("");
  };

  const renamePreset = (id: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    savePresets(
      presets.map((preset) =>
        preset.id === id ? { ...preset, name: trimmedName } : preset,
      ),
    );
    setEditingId(null);
    setEditingName("");
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <form onSubmit={savePreset} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={nameInputId} className="sr-only">
          {itemLabel} name
        </label>
        <input
          id={nameInputId}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={`Name this ${itemLabel}`}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={!name.trim() || !canSave}
          className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save {itemLabel}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {presets.length > 0 ? (
        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {presets.map((preset) => (
            <li
              key={preset.id}
              className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                {editingId === preset.id ? (
                  <label htmlFor={editNameInputId} className="sr-only">
                    Rename {preset.name}
                  </label>
                ) : null}
                {editingId === preset.id ? (
                  <input
                    id={editNameInputId}
                    type="text"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                  />
                ) : (
                  <span className="wrap-break-word font-medium text-zinc-900">
                    {preset.name}
                  </span>
                )}
                {getPreview && (
                  <p className="mt-1 wrap-break-word font-mono text-xs text-zinc-600">
                    Preview: {getPreview(preset.value) || "No notes"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {editingId === preset.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => renamePreset(preset.id)}
                      disabled={!editingName.trim()}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save name
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(preset.id);
                      setEditingName(preset.name);
                    }}
                    aria-label={`Rename ${preset.name}`}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Rename
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onLoad(preset.value)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() =>
                    savePresets(presets.filter(({ id }) => id !== preset.id))
                  }
                  aria-label={`Delete ${preset.name}`}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-600">No saved {itemLabel}s yet.</p>
      )}
    </section>
  );
}
