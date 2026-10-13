import { dumpVault, importVault } from './vault';

function isFsSupported() {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export function supportsFileSystemAccess() {
  return isFsSupported();
}

function fallbackDownload(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportVault() {
  const data = await dumpVault();
  const text = JSON.stringify(data, null, 2);
  const filename = `passvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  if (isFsSupported()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Password Vault backup',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
      fallbackDownload(filename, text);
      return true;
    }
  }
  fallbackDownload(filename, text);
  return true;
}

export async function importVaultFile(onSuccess) {
  const readFile = () =>
    new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return reject(new Error('cancelled'));
        file.text().then(resolve, reject);
      };
      input.click();
    });

  let text;
  if (isFsSupported()) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Password Vault backup',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      text = await file.text();
    } catch (err) {
      if (err?.name === 'AbortError') return false;
      text = await readFile();
    }
  } else {
    text = await readFile();
  }

  await importVault(JSON.parse(text));
  onSuccess?.();
  return true;
}
