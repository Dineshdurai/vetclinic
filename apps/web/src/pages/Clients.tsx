import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, Client, fullName } from '../api';
import { Empty, Field, Modal, useAction } from '../ui';

const blank = { firstName: '', lastName: '', email: '', phone: '', address: '', addressDetails: '' };

function ClientForm({ client, onClose, onSaved }: { client?: Client; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ ...blank, ...(client || {}) });
  const { error, busy, run } = useAction();
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.keys(blank).map((k) => [k, f[k as keyof typeof blank] || undefined]));
    run(async () => {
      await api(client ? `/clients/${client.uuid}` : '/clients', { method: client ? 'PATCH' : 'POST', body });
      onSaved();
    });
  };
  return (
    <Modal title={client ? 'Edit client' : 'New client'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="row">
          <Field label="First name"><input value={f.firstName} onChange={set('firstName')} required /></Field>
          <Field label="Last name"><input value={f.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Email"><input type="email" value={f.email} onChange={set('email')} required /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Address"><input value={f.address} onChange={set('address')} /></Field>
        <Field label="Address details"><input value={f.addressDetails} onChange={set('addressDetails')} /></Field>
        {error && <div className="error">{error}</div>}
        <div className="actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>Save</button></div>
      </form>
    </Modal>
  );
}

export default function Clients() {
  const [list, setList] = useState<Client[]>([]);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Client | 'new' | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<{ data: Client[] }>(`/clients?q=${encodeURIComponent(q)}`).then((r) => setList(r.data)).catch((e) => setErr(e.message)), [q]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  const remove = async (c: Client) => {
    if (!confirm(`Delete ${fullName(c)} and their patients?`)) return;
    await api(`/clients/${c.uuid}`, { method: 'DELETE' }); load();
  };
  return (
    <>
      <header className="page-head"><h1>Clients</h1><button className="primary" onClick={() => setEdit('new')}>+ New client</button></header>
      <input className="search" placeholder="Search name, email or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
      {err && <div className="error">{err}</div>}
      <section className="card">
        {list.length === 0 ? <Empty text="No clients found." /> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Patients</th><th /></tr></thead>
            <tbody>{list.map((c) => (
              <tr key={c.uuid}>
                <td><strong>{fullName(c)}</strong></td><td>{c.email}</td><td>{c.phone || '—'}</td>
                <td>{c.pets && Array.isArray(c.pets) && c.pets.length ? c.pets.map((p) => p.name).join(', ') : '—'}</td>
                <td className="right"><button className="ghost" onClick={() => setEdit(c)}>Edit</button> <button className="ghost danger" onClick={() => remove(c)}>Delete</button></td>
              </tr>))}</tbody>
          </table>)}
      </section>
      {edit && <ClientForm client={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}
