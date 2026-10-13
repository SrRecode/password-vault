import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useVault } from '../auth/VaultContext';
import { PasswordInput } from '../components/ui';

export function LockScreen() {
  const { unlock } = useVault();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      await unlock(password);
    } catch (err) {
      setBusy(false);
      setPassword('');
      setError(err?.message === 'wrong-password' ? 'Wrong master password.' : 'Could not unlock.');
    }
  };

  return (
    <div className="anim-fade flex min-h-dvh flex-col items-center justify-center px-8">
      <div className="w-full max-w-[320px]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-ink">
          <Lock size={26} />
        </div>
        <h1 className="mt-6 text-center font-serif text-[26px] font-semibold">
          Vault is <span className="highlight">locked</span>
        </h1>
        <p className="mt-2 text-center text-[14px] text-soft">
          Enter your master password to continue.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Master password"
            autoFocus
          />
          {error && <p className="text-[13.5px] text-danger">{error}</p>}
          <button
            type="submit"
            disabled={!password || busy}
            className="w-full rounded-xl bg-navy py-3.5 text-[15px] font-semibold text-navy-ink transition-opacity disabled:opacity-40"
          >
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
