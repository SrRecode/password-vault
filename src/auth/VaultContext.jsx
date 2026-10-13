import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  isVaultInitialized,
  isUnlocked,
  lockVault,
  unlockVault,
  setupVault,
} from '../services/vault';

const VaultContext = createContext(null);

const LOCK_KEY = 'pv-lock-after';

export function VaultProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [toast, setToast] = useState(null);
  const [lockAfter, setLockAfter] = useState(() => {
    const v = Number(localStorage.getItem(LOCK_KEY));
    return Number.isFinite(v) ? v : 5;
  });
  const timer = useRef(null);

  const showToast = useCallback((message) => {
    setToast({ message, at: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    isVaultInitialized()
      .then((init) => setStatus(init ? (isUnlocked() ? 'unlocked' : 'locked') : 'setup'))
      .catch(() => setStatus('setup'));
  }, []);

  const lock = useCallback(() => {
    lockVault();
    setStatus('locked');
  }, []);

  const setLockAfterPref = useCallback((minutes) => {
    setLockAfter(minutes);
    localStorage.setItem(LOCK_KEY, String(minutes));
  }, []);

  useEffect(() => {
    if (status !== 'unlocked') return undefined;
    if (lockAfter === 0) {
      const onHide = () => {
        if (document.hidden) lock();
      };
      document.addEventListener('visibilitychange', onHide);
      return () => document.removeEventListener('visibilitychange', onHide);
    }
    if (lockAfter < 0) return undefined;
    const arm = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(lock, lockAfter * 60000);
    };
    const events = ['pointerdown', 'keydown', 'wheel'];
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer.current);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, [status, lockAfter, lock]);

  const setup = useCallback(async (password) => {
    await setupVault(password);
    setStatus('unlocked');
  }, []);

  const unlock = useCallback(async (password) => {
    await unlockVault(password);
    setStatus('unlocked');
  }, []);

  return (
    <VaultContext.Provider
      value={{ status, toast, showToast, lock, setup, unlock, lockAfter, setLockAfterPref }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  return useContext(VaultContext);
}
