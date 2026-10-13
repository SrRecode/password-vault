import { useState } from 'react';
import { Download, Upload, FileJson, ShieldCheck } from 'lucide-react';
import { exportVault, importVaultFile, supportsFileSystemAccess } from '../services/backup';

export function BackupPage({ onRestored, toast }) {
  const [busy, setBusy] = useState(false);
  const fsSupported = supportsFileSystemAccess();

  const doExport = async () => {
    setBusy(true);
    try {
      const ok = await exportVault();
      if (ok) toast?.('Backup downloaded — keep it safe');
    } catch {
      toast?.('Export failed');
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    setBusy(true);
    try {
      await importVaultFile(() => {
        onRestored?.();
        toast?.('Backup restored — lock and unlock with its master password');
      });
    } catch (err) {
      if (err?.message !== 'cancelled') toast?.('That file is not a valid vault backup');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 pb-36 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="card-shell flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
          <ShieldCheck size={19} />
        </div>
        <p className="text-[13.5px] leading-snug text-soft">
          Backups contain your entries exactly as stored — <span className="font-semibold text-ink">encrypted with your master password</span>.
          A backup can only be opened with the master password it was created with.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={doExport}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-4 py-4 text-left transition-colors hover:bg-field/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-navy-ink">
            <Download size={17} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">Export backup</span>
            <span className="mt-0.5 block text-[12.5px] text-soft">
              Download all entries as one encrypted JSON file
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={doImport}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-4 py-4 text-left transition-colors hover:bg-field/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-field">
            <Upload size={17} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">Import backup</span>
            <span className="mt-0.5 block text-[12.5px] text-soft">
              Restore from a passvault-backup.json file
            </span>
          </span>
        </button>
      </div>

      <div className="mt-6 space-y-2.5 px-1">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-soft">
          Good to know
        </h2>
        {[
          'Backups are portable — restore them on any device with this app.',
          fsSupported
            ? 'This browser supports the File System Access API, so you can pick the exact save location.'
            : 'This browser saves downloads to your default download folder.',
          'After importing, lock and unlock with the backup\'s master password to load it into memory.',
          'Exporting does not log you out or change your current master password.',
        ].map((t) => (
          <p key={t} className="flex gap-2 text-[13px] leading-snug text-soft">
            <FileJson size={14} className="mt-0.5 shrink-0 text-line" />
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}
