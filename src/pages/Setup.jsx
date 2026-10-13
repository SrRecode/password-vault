import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useVault } from '../auth/VaultContext';
import { PasswordInput } from '../components/ui';
import { StrengthMeter } from '../components/StrengthMeter';

export function Setup() {
  const { setup } = useVault();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = password.length >= 8 && confirm === password && !busy;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      await setup(password);
    } catch {
      setBusy(false);
      setError('Could not create the vault. Please try again.');
    }
  };

  return (
    <div className="anim-fade flex min-h-dvh flex-col px-6 pb-10 pt-[max(env(safe-area-inset-top),24px)]">
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-navy-ink">
          <ShieldCheck size={26} />
        </div>
        <h1 className="mt-6 font-serif text-[34px] font-semibold leading-tight">
          Create your <span className="highlight">master password</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-soft">
          Your master password encrypts everything in this vault. It is never stored and never
          leaves this device — if you forget it, your data cannot be recovered.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="master" className="mb-1.5 block text-[13px] font-medium text-soft">
              Master password
            </label>
            <PasswordInput
              id="master"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              autoFocus
            />
            <StrengthMeter password={password} />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-[13px] font-medium text-soft">
              Confirm master password
            </label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat it exactly"
            />
            {confirm && confirm !== password && (
              <p className="mt-1.5 text-[12.5px] text-danger">Passwords do not match.</p>
            )}
          </div>

          {error && <p className="text-[13.5px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-[15px] font-semibold text-navy-ink transition-opacity disabled:opacity-40"
          >
            <KeyRound size={17} />
            {busy ? 'Creating vault…' : 'Create vault'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] leading-snug text-soft">
          Everything stays offline in your browser. No account, no cloud, no tracking.
        </p>
      </div>
    </div>
  );
}
