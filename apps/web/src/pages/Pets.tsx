import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, Client, fmtDate, fullName, Pet } from '../api';
import { Empty, Field, Modal, useAction } from '../ui';

function PetForm({ pet, onClose, onSaved }: { pet?: Pet; onClose: () => void; onSaved: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [f, setF] = useState({
    name: pet?.name || '', race: pet?.race || '', gender: pet?.gender || 'female',
    birht: pet?.birht?.slice(0, 10) || '', clientUuid: pet?.client?.uuid || '',
  });
  const { error, busy, run } = useAction();
  useEffect(() => { api<{ data: Client[] }>('/clients').then((r) => setClients(r.data)); }, []);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api(pet ? `/pets/${pet.uuid}` : '/pets', {
        method: pet ? 'PATCH' : 'POST', body: { ...f, race: f.race || undefined, birht: f.birht || undefined },
      });
      onSaved();
    });
  };
  return (
    <Modal title={pet ? 'Edit patient' : 'New patient'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <Field label="Name"><input value={f.name} onChange={set('name')} required /></Field>
        <Field label="Owner">
          <select value={f.clientUuid} onChange={set('clientUuid')} required>
            <option value="">Select a client…</option>
            {clients.map((c) => <option key={c.uuid} value={c.uuid}>{fullName(c)} ({c.email})</option>)}
          </select>
        </Field>
        <div className="row">
          <Field label="Breed / species"><input value={f.race} onChange={set('race')} /></Field>
          <Field label="Gender"><select value={f.gender} onChange={set('gender')}><option value="female">Female</option><option value="male">Male</option></select></Field>
        </div>
        <Field label="Date of birth"><input type="date" value={f.birht} onChange={set('birht')} /></Field>
        {error && <div className="error">{error}</div>}
        <div className="actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>Save</button></div>
      </form>
    </Modal>
  );
}

export default function Pets() {
  const [list, setList] = useState<Pet[]>([]);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Pet | 'new' | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<{ data: Pet[] }>(`/pets?q=${encodeURIComponent(q)}`).then((r) => setList(r.data)).catch((e) => setErr(e.message)), [q]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  const remove = async (p: Pet) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    await api(`/pets/${p.uuid}`, { method: 'DELETE' }); load();
  };
  return (
    <>
      <header className="page-head"><h1>Patients</h1><button className="primary" onClick={() => setEdit('new')}>+ New patient</button></header>
      <input className="search" placeholder="Search by name or breed…" value={q} onChange={(e) => setQ(e.target.value)} />
      {err && <div className="error">{err}</div>}
      <section className="card">
        {list.length === 0 ? <Empty text="No patients found." /> : (
          <table>
            <thead><tr><th>Name</th><th>Breed</th><th>Gender</th><th>Born</th><th>Owner</th><th /></tr></thead>
            <tbody>{list.map((p) => (
              <tr key={p.uuid}>
                <td><strong>{p.name}</strong></td><td>{p.race || '—'}</td><td className="cap">{p.gender}</td>
                <td>{fmtDate(p.birht)}</td><td>{fullName(p.client)}</td>
                <td className="right"><button className="ghost" onClick={() => setEdit(p)}>Edit</button> <button className="ghost danger" onClick={() => remove(p)}>Delete</button></td>
              </tr>))}</tbody>
          </table>)}
      </section>
      {edit && <PetForm pet={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}
