import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export function IconBtn({ children, onClick, label, className = '', active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`h-10 w-10 shrink-0 rounded-full border border-line flex items-center justify-center transition-colors ${
        active ? 'bg-accent border-accent text-accent-ink' : 'text-ink hover:bg-field'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Sheet({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 mx-auto max-w-md overflow-y-auto bg-bg anim-sheet">
      {children}
    </div>
  );
}

export function SheetHeader({ title, onClose }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-sm">
      <h2 className="font-serif text-[20px] font-semibold">{title}</h2>
      <IconBtn onClick={onClose} label="Close">
        <X size={19} />
      </IconBtn>
    </div>
  );
}

export function Confirm({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8" onClick={onCancel}>
      <div className="card-shell w-full max-w-[320px] p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-[19px] font-semibold">{title}</h3>
        {body && <p className="mt-1.5 text-[14px] leading-snug text-soft">{body}</p>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line py-2.5 text-[14px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-danger py-2.5 text-[14px] font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 className="mt-7 mb-2.5 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-soft">
      {children}
    </h2>
  );
}

export function SettingRow({ title, sub, children, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-b-0 ${
        onClick ? 'hover:bg-field/60' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{title}</div>
        {sub && <div className="mt-0.5 text-[12.5px] leading-snug text-soft">{sub}</div>}
      </div>
      {children}
    </Tag>
  );
}

export function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-line'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-card shadow-sm transition-all ${
          checked ? 'left-[23px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

export function PasswordInput({ value, onChange, placeholder, id, autoFocus = false }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-line bg-field px-4 py-3 pr-12 text-[15px] outline-none focus:border-ink/40"
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-soft hover:bg-line/60"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
