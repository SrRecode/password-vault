import { Lock, Settings, ShieldCheck } from 'lucide-react';

export function TopBar({ onSettings, onLock }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-navy-ink">
          <ShieldCheck size={16} />
        </span>
        <span className="font-serif text-[19px] font-semibold">Password Vault</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onLock}
          aria-label="Lock vault now"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-field"
        >
          <Lock size={18} />
        </button>
        <button
          type="button"
          onClick={onSettings}
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-field"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
