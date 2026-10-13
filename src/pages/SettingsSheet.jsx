import { useState } from 'react';
import { Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { Sheet, SheetHeader, SettingRow, SectionTitle, Confirm } from '../components/ui';
import { useVault } from '../auth/VaultContext';
import { wipeVault } from '../services/vault';

const LOCK_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 0, label: 'Only when tab hidden' },
  { value: -1, label: 'Never (not recommended)' },
];

export function SettingsSheet({ onClose }) {
  const { lockAfter, setLockAfterPref, lock } = useVault();
  const [confirmWipe, setConfirmWipe] = useState(false);

  const doWipe = async () => {
    await wipeVault();
    setConfirmWipe(false);
    onClose();
    window.location.reload();
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader title="Settings" onClose={onClose} />
      <div className="px-4 pb-12">
        <SectionTitle>Security</SectionTitle>
        <div className="card-shell">
          <SettingRow
            title="Auto-lock after"
            sub="Vault locks when you're idle for this long"
          >
            <select
              value={lockAfter}
              onChange={(e) => setLockAfterPref(Number(e.target.value))}
              className="rounded-lg border border-line bg-field px-2.5 py-1.5 text-[13.5px] font-medium outline-none"
            >
              {LOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow title="Lock now" sub="Lock the vault immediately" onClick={lock}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-field">
              <Lock size={15} />
            </span>
          </SettingRow>
        </div>

        <SectionTitle>Data</SectionTitle>
        <div className="card-shell">
          <SettingRow
            title="Erase vault"
            sub="Deletes every entry from this device. Export a backup first."
            onClick={() => setConfirmWipe(true)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
              <Trash2 size={15} />
            </span>
          </SettingRow>
        </div>

        <SectionTitle>About</SectionTitle>
        <div className="card-shell">
          <SettingRow
            title="Password Vault"
            sub="Offline-only, zero-knowledge. Your master password derives an AES-256-GCM key via PBKDF2; entries are encrypted in IndexedDB and never leave this device."
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-ink">
              <ShieldCheck size={15} />
            </span>
          </SettingRow>
          <SettingRow title="Encryption" sub="PBKDF2 (600k iterations, SHA-256) → AES-GCM 256" />
        </div>
      </div>

      <Confirm
        open={confirmWipe}
        title="Erase this vault?"
        body="Every entry on this device will be permanently deleted. There is no undo — unless you exported a backup."
        confirmLabel="Erase everything"
        onConfirm={doWipe}
        onCancel={() => setConfirmWipe(false)}
      />
    </Sheet>
  );
}
