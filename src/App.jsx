import { useState } from 'react';
import { VaultProvider, useVault } from './auth/VaultContext';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { Setup } from './pages/Setup';
import { LockScreen } from './pages/LockScreen';
import { VaultList } from './pages/VaultList';
import { EntryEditor } from './pages/EntryEditor';
import { BackupPage } from './pages/BackupPage';
import { SettingsSheet } from './pages/SettingsSheet';

function Shell() {
  const { status, toast, showToast, lock } = useVault();
  const [tab, setTab] = useState('vault');
  const [editorId, setEditorId] = useState(undefined);
  const [showSettings, setShowSettings] = useState(false);

  if (status === 'loading') return null;
  if (status === 'setup') return <Setup />;
  if (status === 'locked') return <LockScreen />;

  const openNew = () => setEditorId(null);
  const openEdit = (id) => setEditorId(id);

  const page =
    tab === 'vault' ? (
      <VaultList onOpenEntry={openEdit} onNew={openNew} toast={showToast} />
    ) : (
      <BackupPage
        toast={showToast}
        onRestored={() => {
          setShowSettings(false);
          setTab('vault');
          lock();
          showToast('Backup restored — unlock with its master password');
        }}
      />
    );

  return (
    <div className="relative min-h-dvh">
      <TopBar onSettings={() => setShowSettings(true)} onLock={lock} />

      <main>{page}</main>

      <BottomNav tab={tab} onTab={setTab} onNew={openNew} />

      {editorId !== undefined && (
        <EntryEditor
          key={editorId ?? 'new'}
          entryId={editorId}
          onClose={() => setEditorId(undefined)}
          toast={showToast}
        />
      )}

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}

      {toast && (
        <div
          key={toast.at}
          className="anim-toast fixed right-[max(16px,calc((100%-28rem)/2+16px))] top-[max(env(safe-area-inset-top),14px)] z-[60] max-w-[min(86vw,340px)] rounded-full bg-navy px-4 py-2 text-[13.5px] font-medium text-navy-ink shadow-lg"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <div className="app-frame relative mx-auto min-h-dvh w-full max-w-md bg-bg sm:shadow-[0_0_60px_rgba(29,28,25,0.10)] sm:ring-1 sm:ring-line">
        <Shell />
      </div>
    </VaultProvider>
  );
}
