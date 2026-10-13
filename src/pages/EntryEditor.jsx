import { useEffect, useState } from 'react';
import { Check, Dices, Star, Trash2 } from 'lucide-react';
import { Sheet, SheetHeader, PasswordInput, Confirm } from '../components/ui';
import { StrengthMeter } from '../components/StrengthMeter';
import { deleteEntry, getEntry, saveEntry } from '../services/vault';

const CATEGORIES = ['General', 'Work', 'Finance', 'Social', 'Shopping', 'Other'];

function generatePassword(length, opts) {
  const sets = [];
  if (opts.lower) sets.push('abcdefghijkmnopqrstuvwxyz');
  if (opts.upper) sets.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
  if (opts.digits) sets.push('23456789');
  if (opts.symbols) sets.push('!@#$%^&*()-_=+[]{}');
  const all = sets.join('');
  if (!all) return '';
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  return [...buf].map((n) => all[n % all.length]).join('');
}

export function EntryEditor({ entryId, onClose, onDeleted, toast }) {
  const [form, setForm] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'General',
    favorite: false,
  });
  const [showGenerator, setShowGenerator] = useState(false);
  const [genLen, setGenLen] = useState(20);
  const [genOpts, setGenOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!entryId) return;
    getEntry(entryId).then((e) => {
      if (e) setForm(e);
    });
  }, [entryId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));

  const save = async () => {
    if (!form.title.trim() && !form.password) {
      toast?.('Add a title or password first');
      return;
    }
    setSaving(true);
    try {
      await saveEntry({ ...form, id: entryId });
      toast?.(entryId ? 'Entry updated' : 'Entry saved');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    await deleteEntry(entryId);
    setConfirmDelete(false);
    onDeleted?.();
    onClose();
  };

  const gen = generatePassword(genLen, genOpts);

  return (
    <Sheet onClose={onClose}>
      <SheetHeader title={entryId ? 'Edit entry' : 'New entry'} onClose={onClose} />

      <div className="space-y-4 px-4 pb-12 pt-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-soft">Title</label>
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. GitHub, Netflix, Bank"
            className="w-full rounded-xl border border-line bg-field px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-soft">Username / email</label>
          <input
            value={form.username}
            onChange={set('username')}
            placeholder="you@example.com"
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-field px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[13px] font-medium text-soft">Password</label>
            <button
              type="button"
              onClick={() => setShowGenerator((s) => !s)}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12.5px] font-medium text-soft hover:bg-field"
            >
              <Dices size={13} />
              Generate
            </button>
          </div>
          <PasswordInput value={form.password} onChange={set('password')} placeholder="Password" />
          <StrengthMeter password={form.password} />

          {showGenerator && (
            <div className="card-shell mt-3 space-y-3 p-4 anim-sheet">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="8"
                  max="40"
                  value={genLen}
                  onChange={(e) => setGenLen(Number(e.target.value))}
                  className="flex-1 accent-[#182340]"
                />
                <span className="w-7 text-center text-[13px] font-semibold">{genLen}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ['lower', 'a-z'],
                  ['upper', 'A-Z'],
                  ['digits', '0-9'],
                  ['symbols', '#$&'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGenOpts((o) => ({ ...o, [key]: !o[key] }))}
                    className={`rounded-full border px-3 py-1 text-[12.5px] font-medium ${
                      genOpts[key]
                        ? 'border-accent bg-accent text-accent-ink'
                        : 'border-line text-soft'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-field px-3 py-2 text-[13px]">{gen}</code>
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, password: gen }));
                    setShowGenerator(false);
                  }}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-navy px-3 text-[13px] font-semibold text-navy-ink"
                >
                  <Check size={14} /> Use
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-soft">Website</label>
          <input
            value={form.url}
            onChange={set('url')}
            placeholder="https://example.com"
            inputMode="url"
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-field px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-soft">Notes</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Recovery codes, security questions, anything else…"
            rows={3}
            className="w-full resize-none rounded-xl border border-line bg-field px-4 py-3 text-[15px] outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-soft">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: c }))}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${
                  form.category === c
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line text-soft'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
          className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left"
        >
          <Star
            size={18}
            className={form.favorite ? 'fill-accent text-accent' : 'text-soft'}
          />
          <span className="flex-1 text-[14.5px] font-medium">Mark as favourite</span>
          <span className="text-[12.5px] text-soft">{form.favourite ? 'Yes' : 'No'}</span>
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center rounded-xl bg-navy py-3.5 text-[15px] font-semibold text-navy-ink transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : entryId ? 'Save changes' : 'Save entry'}
        </button>

        {entryId && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/40 py-3 text-[14px] font-semibold text-danger"
          >
            <Trash2 size={15} /> Delete entry
          </button>
        )}
      </div>

      <Confirm
        open={confirmDelete}
        title="Delete this entry?"
        body="This permanently removes the entry from your vault. This cannot be undone."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Sheet>
  );
}
