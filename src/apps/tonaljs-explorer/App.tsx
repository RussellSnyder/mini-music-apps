"use client";
import Link from "next/link";
import { useState } from "react";
import { MODULES, type Demo, type ExplorerModule, type Field } from "./modules";

const inputClassName =
  "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20";

function runDemo(demo: Demo, values: Record<string, string>) {
  try {
    const result = demo.run(values);
    return JSON.stringify(result === undefined ? null : result, null, 2);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Finds which fields a demo reads by recording the keys its snippet accesses.
function usedFieldIds(demo: Demo, module: ExplorerModule) {
  const used = new Set<string>();
  const tracker = new Proxy<Record<string, string>>(
    {},
    {
      get: (_, key) => {
        used.add(String(key));
        return module.fields.find((f) => f.id === key)?.defaultValue ?? "";
      },
    },
  );
  try {
    demo.code(tracker);
  } catch {}
  return module.fields.filter((f) => used.has(f.id));
}

function FieldInput({
  idPrefix,
  field,
  value,
  onChange,
}: {
  idPrefix: string;
  field: Field;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `${idPrefix}-${field.id}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {field.label}
      </label>
      {field.options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
        />
      )}
    </div>
  );
}

function ModulePanel({ module }: { module: ExplorerModule }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(module.fields.map((f) => [f.id, f.defaultValue])),
  );

  return (
    <section className="flex flex-col gap-4" aria-label={module.title}>
      <p className="text-zinc-600">
        {module.description}
        {module.docs.map((doc) => (
          <a
            key={doc.url}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-indigo-600 hover:underline"
          >
            {doc.label ? `${doc.label} doc` : "doc"} ↗
          </a>
        ))}
      </p>
      <div className="flex flex-col gap-3">
        {module.demos.map((demo) => (
          <div
            key={demo.label}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <h3 className="mb-2 font-mono text-sm font-semibold text-indigo-700">
              {demo.label}
            </h3>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              {usedFieldIds(demo, module).map((field) => (
                <FieldInput
                  key={field.id}
                  idPrefix={`${module.id}-${demo.label}`}
                  field={field}
                  value={values[field.id]}
                  onChange={(value) =>
                    setValues((current) => ({ ...current, [field.id]: value }))
                  }
                />
              ))}
            </div>
            <code className="mb-2 block overflow-x-auto rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700">
              {demo.code(values)}
            </code>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm text-zinc-800">
              {runDemo(demo, values)}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const active = MODULES.find((m) => m.id === activeId) ?? MODULES[0];

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        Mini Music Apps
      </Link>
      <h1 className="text-3xl font-semibold">TonalJS Explorer</h1>
      <p className="text-zinc-600">
        Try out the features of the Tonal music theory library. Pick a module,
        edit the inputs and see what each function returns.
      </p>
      <div className="flex flex-wrap gap-2" role="tablist">
        {MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            role="tab"
            aria-selected={module.id === activeId}
            onClick={() => setActiveId(module.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              module.id === activeId
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {module.title}
          </button>
        ))}
      </div>
      <ModulePanel key={active.id} module={active} />
    </div>
  );
}

export default App;
