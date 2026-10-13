import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { Search, Star, Globe, Copy } from 'lucide-react';
import { getEntry } from '../services/vault';
import { IconBtn } from '../components/ui';

export function VaultList({ onOpenEntry, onNew, toast }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const entries = useLiveQuery(
    () => db.entries.orderBy('updatedAt').reverse().toArray(),
    []
  );

  const categories = useMemo(() => {
    if (!entries) return ['All'];
    return ['All', ...new Set(entries.map((e) => e.category).filter(Boolean))];
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== 'All' && e.category !== category) return false;
      if (!q) return true;
      const url = (e.url || '').toLowerCase();
      return e.title.toLowerCase().includes(q) || url.includes(q);
    });
  }, [entries, query, category]);

  const favorites = filtered.filter((e) => e.favorite);
  const rest = filtered.filter((e) => !e.favorite);

  const copyPassword = async (id) => {
    try {
      const entry = await getEntry(id);
      if (!entry?.password) return;
      await navigator.clipboard.writeText(entry.password);
      setCopiedId(id);
      toast?.('Password copied');
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast?.('Could not decrypt entry');
    }
  };

  const Row = ({ e }) => (
    <button
      type="button"
      onClick={() => onOpenEntry(e.id)}
      className="card-shell flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-field/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-field font-serif text-[17px] font-semibold">
        {e.title.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-semibold">{e.title}</span>
          {e.favorite && <Star size={13} className="shrink-0 fill-accent text-accent" />}
        </span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-soft">
          {e.url ? (
            <>
              <Globe size={11} className="shrink-0" />
              <span className="truncate">{e.url.replace(/^https?:\/\//, '')}</span>
            </>
          ) : (
            e.category
          )}
        </span>
      </span>
      <IconBtn
        label="Copy password"
        onClick={async (ev) => {
          ev.stopPropagation();
          copyPassword(e.id);
        }}
      >
        <Copy size={15} className={copiedId === e.id ? 'text-[#5a8a3c]' : ''} />
      </IconBtn>
    </button>
  );

  return (
    <div className="px-4 pb-36 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles and sites…"
          className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-4 text-[15px] outline-none focus:border-ink/40"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              category === c
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line bg-card text-soft'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!entries ? (
        <p className="mt-10 text-center text-[14px] text-soft">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-[20px] font-semibold">
            {entries.length === 0 ? 'Your vault is empty' : 'No matches'}
          </p>
          <p className="mt-1.5 text-[13.5px] text-soft">
            {entries.length === 0
              ? 'Tap the button below to store your first password.'
              : 'Try a different search or category.'}
          </p>
          {entries.length === 0 && (
            <button
              type="button"
              onClick={onNew}
              className="mt-5 rounded-xl bg-navy px-6 py-3 text-[14px] font-semibold text-navy-ink"
            >
              Add your first entry
            </button>
          )}
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
            <>
              <h2 className="mt-6 mb-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-soft">
                Favourites
              </h2>
              <div className="space-y-2">
                {favorites.map((e) => (
                  <Row key={e.id} e={e} />
                ))}
              </div>
            </>
          )}
          {rest.length > 0 && (
            <>
              <h2 className="mt-6 mb-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-soft">
                All entries
              </h2>
              <div className="space-y-2">
                {rest.map((e) => (
                  <Row key={e.id} e={e} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
