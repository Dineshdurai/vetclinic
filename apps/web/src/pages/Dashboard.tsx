import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, fullName, Stats } from '../api';
import { Empty } from '../ui';

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api<Stats>('/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="error">{err}</div>;
  if (!s) return <p className="muted">Loading…</p>;
  const tile = (n: number, label: string, to: string) => (
    <Link to={to} className="tile"><strong>{n}</strong><span>{label}</span></Link>
  );
  return (
    <>
      <header className="page-head"><h1>Dashboard</h1></header>
      <div className="tiles">
        {tile(s.appointmentsToday, 'Appointments today', '/appointments')}
        {tile(s.appointmentsUpcoming, 'Upcoming appointments', '/appointments')}
        {tile(s.clients, 'Clients', '/clients')}
        {tile(s.pets, 'Patients', '/pets')}
      </div>
      <section className="card">
        <h2>Next 7 days</h2>
        {s.upcoming.length === 0 ? <Empty text="Nothing scheduled this week." /> : (
          <table>
            <thead><tr><th>When</th><th>Patient</th><th>Owner</th><th>Reason</th><th>Vet</th></tr></thead>
            <tbody>{s.upcoming.map((a) => (
              <tr key={a.id}>
                <td>{fmtDate(a.scheduleAt)} {a.scheduleTime}</td><td>{a.pet?.name}</td>
                <td>{fullName(a.pet?.client)}</td><td>{a.proposite}</td><td>{fullName(a.user) || a.user?.username}</td>
              </tr>))}</tbody>
          </table>)}
      </section>
    </>
  );
}
