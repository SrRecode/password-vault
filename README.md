# Password Vault

A private, offline-first password vault you can install on your phone or desktop. Your entries never leave your device — everything is encrypted locally with a key derived from your master password.

**Live:**
- Vercel: https://password-vault-srrecode.vercel.app *(pending first deploy)*
- GitHub Pages: https://srrecode.github.io/password-vault/ *(after Pages is enabled in repo settings)*

## Features

- **Zero-knowledge encryption** — your master password derives an AES-256-GCM key via PBKDF2 (600k iterations, SHA-256); sensitive fields (username, password, notes) are encrypted individually in IndexedDB
- **Master password** — the only secret. Never stored, never transmitted; a verifier token checks it at unlock. Forgot it = unrecoverable (by design)
- **Auto-lock** — locks after 1 / 5 / 15 minutes of inactivity, only when the tab is hidden, or never; plus lock-on-tab-hide and a manual lock button
- **Password generator** — length 8–40 with lower / upper / digits / symbol sets
- **Strength meter** — zxcvbn scoring while creating or editing entries
- **Search & categories** — instant search across titles and sites, category filter chips, favourites
- **Copy to clipboard** — one-tap copy with auto-clear feedback
- **Encrypted backup** — export all entries as one encrypted JSON file (File System Access API where available) and restore on any device
- **Offline-first PWA** — installable, service worker caches the whole app, works with no connection
- **Desktop layout** — on wide screens the app renders as a centered phone frame with a fixed bottom nav

## Tech stack

| Layer    | Choice                                          |
| -------- | ----------------------------------------------- |
| Build    | [Vite 8](https://vitejs.dev/)                   |
| UI       | React 19 (JSX)                                  |
| Styling  | Tailwind CSS v4                                 |
| Database | IndexedDB via [Dexie 4](https://dexie.org/)     |
| Crypto   | Web Crypto API (PBKDF2 + AES-GCM)               |
| PWA      | vite-plugin-pwa (Workbox service worker)        |
| Icons    | lucide-react                                    |
| Fonts    | Hanken Grotesk + Newsreader (self-hosted)       |

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
git clone https://github.com/SrRecode/password-vault.git
cd password-vault
npm install
npm run dev        # start dev server on http://localhost:5173
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server                |
| `npm run build`   | Production build to `dist/`          |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
  ├─ App.jsx                 # App shell, view routing, phone-frame wrapper
  ├─ main.jsx                # Entry point
  ├─ index.css               # Tailwind v4 + design tokens
  ├─ auth/
  │   └─ VaultContext.jsx    # Lock/unlock state, auto-lock, toasts
  ├─ crypto/
  │   └─ vaultCrypto.js      # PBKDF2 key derivation, AES-GCM field encryption, verifier
  ├─ database/
  │   └─ db.js               # Dexie schema (entries, meta)
  ├─ services/
  │   ├─ vault.js            # Setup/unlock/lock + encrypted CRUD, dump/import
  │   └─ backup.js           # Export/import via File System Access API
  ├─ components/
  │   ├─ ui.jsx              # Shared UI (Sheet, Confirm, SettingRow, PasswordInput, …)
  │   ├─ BottomNav.jsx       # Fixed bottom tab nav
  │   ├─ TopBar.jsx          # Sticky top bar with lock + settings
  │   └─ StrengthMeter.jsx   # zxcvbn strength bar
  └─ pages/
      ├─ Setup.jsx           # Create master password
      ├─ LockScreen.jsx      # Unlock with master password
      ├─ VaultList.jsx       # Search, favourites, category filter, copy
      ├─ EntryEditor.jsx     # Add/edit entry + generator
      ├─ BackupPage.jsx      # Export / import
      └─ SettingsSheet.jsx   # Auto-lock pref, erase vault, about
```

## Security model

- Master password → PBKDF2 (SHA-256, 600,000 iterations, 16-byte random salt) → AES-256-GCM key, held in memory only
- Each sensitive field encrypted with its own random 12-byte IV
- Salt + verifier token live in the `meta` table; entries table holds ciphertext only
- Backups are portable ciphertext dumps — restorable only with the master password they were created with
