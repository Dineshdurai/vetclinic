import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { fullName, session } from './api';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Pets from './pages/Pets';

function Layout() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const s = session.get();
  if (!s) return <Navigate to="/login" replace />;
  const link = (to: string, label: string, icon: string) => (
    <NavLink to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
      <span>{icon}</span>{label}
    </NavLink>
  );
  return (
    <div className="shell">
      <button className="menu icon" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      <aside className={open ? 'open' : ''}>
        <div className="brand">🐾 PetVitality</div>
        <nav>
          {link('/', 'Dashboard', '📊')}
          {link('/appointments', 'Appointments', '📅')}
          {link('/clients', 'Clients', '👥')}
          {link('/pets', 'Patients', '🐶')}
        </nav>
        <div className="who">
          <div><strong>{fullName(s.user) || s.user.username}</strong><small>{s.user.role}</small></div>
          <button className="ghost" onClick={() => { session.clear(); nav('/login'); }}>Sign out</button>
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="clients" element={<Clients />} />
        <Route path="pets" element={<Pets />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
