import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  searching: boolean;
  results: {
    countries: any[];
    activities: any[];
  } | null;
  onClose: () => void;
};

export default function SearchDropdown({
  open,
  searching,
  results,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // close on ESC
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open || !results) return null;

  return (
    <div
      ref={ref}
      className="absolute w-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-md z-50 overflow-hidden"
    >
      {searching && (
        <div className="px-6 py-4 text-sm text-slate-500">Searching…</div>
      )}

      {results.countries?.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-xs uppercase text-slate-400 mb-2">Countries</p>
          {results.countries.map((c) => (
            <div
              key={c.country_id}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <p className="font-medium">{c.country_name}</p>
              <p className="text-sm text-slate-500">{c.region}</p>
            </div>
          ))}
        </div>
      )}

      {results.activities?.length > 0 && (
        <div className="border-t px-4 py-3">
          <p className="text-xs uppercase text-slate-400 mb-2">Activities</p>
          {results.activities.map((a) => (
            <div
              key={a.activity_id}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer flex justify-between"
            >
              <span>{a.name}</span>
              <span className="text-emerald-600">₹ {a.cost}</span>
            </div>
          ))}
        </div>
      )}

      {results.countries.length === 0 && results.activities.length === 0 && (
        <div className="px-6 py-4 text-sm text-slate-500">No results found</div>
      )}
    </div>
  );
}
