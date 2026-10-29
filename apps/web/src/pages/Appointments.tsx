import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, Appointment, fmtDate, fullName, Pet, session, User } from '../api';
import { Empty, Field, Modal, useAction } from '../ui';

const today = () => new Date().toISOString().slice(0, 10);

function ApptForm({ appt, onClose, onSaved }: { appt?: Appointment; onClose: () => void; onSaved: () => void }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [f, setF] = useState({
    petUuid: appt?.pet?.uuid || '', proposite: appt?.proposite || '', description: appt?.description || '',
    scheduleAt: appt?.scheduleAt?.slice(0, 10) || today(), scheduleTime: appt?.scheduleTime || '09:00',
  });
  const { error, busy, run } = useAction();
  useEffect(() => { api<{ data: Pet[] }>('/pets').then((r) => setPets(r.data)); }, []);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api(appt ? `/appointments/${appt.id}` : '/appointments', {
        method: appt ? 'PATCH' : 'POST', body: { ...f, description: f.description || undefined, scheduleTime: f.scheduleTime || undefined },
      });
      onSaved();
    });
  };
  return (
    <Modal title={appt ? 'Edit appointment' : 'New appointment'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <Field label="Patient">
          <select value={f.petUuid} onChange={set('petUuid')} required>
            <option value="">Select a patient…</option>
            {pets.map((p) => <option key={p.uuid} value={p.uuid}>{p.name} — {fullName(p.client)}</option>)}
          </select>
        </Field>
        <Field label="Reason"><input value={f.proposite} onChange={set('proposite')} placeholder="Vaccination, check-up…" required /></Field>
        <div className="row">
          <Field label="Date"><input type="date" value={f.scheduleAt} onChange={set('scheduleAt')} required /></Field>
          <Field label="Time"><input type="time" value={f.scheduleTime} onChange={set('scheduleTime')} /></Field>
        </div>
        <Field label="Notes"><textarea rows={3} value={f.description} onChange={set('description')} /></Field>
        {error && <div className="error">{error}</div>}
        <div className="actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>Save</button></div>
      </form>
    </Modal>
  );
}

export default function Appointments() {
  const [list, setList] = useState<Appointment[]>([]);
  const [from, setFrom] = useState(today());
  const [edit, setEdit] = useState<Appointment | 'new' | null>(null);
  const [err, setErr] = useState('');
  const me: User | undefined = session.get()?.user;
  const load = useCallback(() => api<{ data: Appointment[] }>(`/appointments?from=${from}`).then((r) => setList(r.data)).catch((e) => setErr(e.message)), [from]);
  useEffect(() => { load(); }, [load]);
  const remove = async (a: Appointment) => {
    if (!confirm('Cancel this appointment?')) return;
    await api(`/appointments/${a.id}`, { method: 'DELETE' }); load();
  };
  return (
    <>
      <header className="page-head"><h1>Appointments</h1><button className="primary" onClick={() => setEdit('new')}>+ New appointment</button></header>
      <div className="filters"><label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>{me && <span className="muted">Booking as {fullName(me) || me.username}</span>}</div>
      {err && <div className="error">{err}</div>}
      <section className="card">
        {list.length === 0 ? <Empty text="No appointments from this date." /> : (
          <table>
            <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Owner</th><th>Reason</th><th>Vet</th><th /></tr></thead>
            <tbody>{list.map((a) => (
              <tr key={a.id}>
                <td>{fmtDate(a.scheduleAt)}</td><td>{a.scheduleTime || '—'}</td><td><strong>{a.pet?.name}</strong></td>
                <td>{fullName(a.pet?.client)}</td><td>{a.proposite}</td><td>{fullName(a.user) || a.user?.username}</td>
                <td className="right"><button className="ghost" onClick={() => setEdit(a)}>Edit</button> <button className="ghost danger" onClick={() => remove(a)}>Cancel</button></td>
              </tr>))}</tbody>
          </table>)}
      </section>
      {edit && <ApptForm appt={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}
