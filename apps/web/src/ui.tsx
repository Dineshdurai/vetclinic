import { ReactNode, useState } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal-head"><h2>{title}</h2><button className="icon" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function useAction() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await fn(); return true; } catch (e) { setError((e as Error).message); return false; } finally { setBusy(false); }
  };
  return { error, busy, run, setError };
}

export const Empty = ({ text }: { text: string }) => <div className="empty">{text}</div>;
