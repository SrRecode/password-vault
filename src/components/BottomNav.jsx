import { Download, Plus, Shield } from 'lucide-react';

const TABS = [
  { id: 'vault', label: 'Vault', Icon: Shield },
  { id: 'backup', label: 'Backup', Icon: Download },
];

export function BottomNav({ tab, onTab, onNew }) {
  const Item = ({ t }) => {
    const active = tab === t.id;
    const { Icon } = t;
    return (
      <button
        type="button"
        onClick={() => onTab(t.id)}
        className="flex flex-col items-center gap-1 pb-1 pt-2"
      >
        <Icon size={21} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-ink' : 'text-soft'} />
        <span className={`text-[11px] ${active ? 'font-semibold text-ink' : 'text-soft'}`}>
          {active ? <span className="highlight">{t.label}</span> : t.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-line bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-md grid-cols-3 items-end px-2 pb-[max(env(safe-area-inset-bottom),10px)]">
        <Item t={TABS[0]} />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNew}
            aria-label="Add entry"
            className="relative -translate-y-4"
          >
            <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[18px] bg-accent" />
            <span className="relative flex h-[54px] w-[54px] items-center justify-center rounded-[18px] bg-navy text-navy-ink shadow-[0_4px_14px_rgba(24,35,64,0.3)]">
              <Plus size={26} strokeWidth={2.4} />
            </span>
          </button>
        </div>
        <Item t={TABS[1]} />
      </div>
    </nav>
  );
}
