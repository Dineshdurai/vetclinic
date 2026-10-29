export interface User { uuid: string; username: string; firstName?: string; lastName?: string; role: 'admin' | 'doctor' }
export interface Pet { uuid: string; name: string; race?: string; gender: 'female' | 'male'; birht?: string; client?: Client; appointments?: Appointment[] }
export interface Client { uuid: string; firstName: string; lastName?: string; email: string; phone?: string; address?: string; addressDetails?: string; pets?: Pet[] }
export interface Appointment { id: number; proposite: string; description?: string; scheduleAt: string; scheduleTime?: string; pet?: Pet; user?: User }
export interface Stats { clients: number; pets: number; appointmentsToday: number; appointmentsUpcoming: number; upcoming: Appointment[] }

const KEY = 'pv_session';
export const session = {
  get(): { token: string; user: User } | null {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  },
  set(v: { token: string; user: User }) { localStorage.setItem(KEY, JSON.stringify(v)); },
  clear() { localStorage.removeItem(KEY); },
};

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const s = session.get();
  const res = await fetch(`/api${path}`, {
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: `Bearer ${s.token}` } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401 && path !== '/auth/login') {
    session.clear();
    window.location.href = '/login';
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(m) ? m.join(', ') : m || res.statusText);
  }
  return data as T;
}

export const fullName = (c?: { firstName?: string; lastName?: string }) =>
  [c?.firstName, c?.lastName].filter(Boolean).join(' ');
export const fmtDate = (d?: string) => (d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
