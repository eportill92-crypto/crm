import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const C = {
  bg: '#0C0E14', bgMid: '#14161E', bgCard: '#1C2030', bgEl: '#1E2235',
  accent: '#1D6FA4', accentHover: '#155d8a',
  green: '#27AE60', greenDim: '#1a6e3c',
  yellow: '#F39C12', red: '#E74C3C',
  text: '#F0F1F5', muted: '#8B8FA8', border: '#2A2D3E',
};

// ─── Toast system ──────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

function Toasts({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#3d1a1a' : t.type === 'success' ? '#1a3d2a' : C.bgCard,
          border: `1px solid ${t.type === 'error' ? C.red : t.type === 'success' ? C.green : C.border}`,
          color: t.type === 'error' ? '#ff8080' : t.type === 'success' ? '#6fcf97' : C.text,
          borderRadius: 8, padding: '10px 16px', fontSize: 13, maxWidth: 320,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ─── Elapsed timer ─────────────────────────────────────────────────────────────
function ElapsedTimer({ startedAt, pausedSince, totalPausedMs = 0 }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    function calc() {
      const now = Date.now();
      const start = new Date(startedAt).getTime();
      let paused = totalPausedMs;
      if (pausedSince) paused += (now - new Date(pausedSince).getTime());
      setElapsed(Math.max(0, now - start - paused));
    }
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [startedAt, pausedSince, totalPausedMs]);

  const s = Math.floor(elapsed / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return <span>{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(sec).padStart(2,'0')}</span>;
}

function PauseTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    function calc() { setElapsed(Math.max(0, Date.now() - new Date(startedAt).getTime())); }
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [startedAt]);
  const s = Math.floor(elapsed / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return <span>{String(m).padStart(2,'0')}:{String(sec).padStart(2,'0')}</span>;
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ onClose, children, title, width = 480 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: C.bgCard, borderRadius: 16, padding: 28, width: '100%', maxWidth: width,
        border: `1px solid ${C.border}`, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, color = C.accent, small, style: extra }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? '7px 14px' : '10px 18px',
    borderRadius: 7, border: 'none', background: disabled ? '#333' : color,
    color: '#fff', fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s', fontFamily: 'system-ui', ...extra,
  }}>{children}</button>
);

const Input = ({ value, onChange, placeholder, type = 'text', style: extra }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
      background: C.bgEl, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
      fontFamily: 'system-ui', ...extra,
    }}
  />
);

const Label = ({ children }) => (
  <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{children}</div>
);

// ─── ADMIN: Machines tab ────────────────────────────────────────────────────────
function MachinesTab({ toast }) {
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modal, setModal] = useState(null); // null | {mode:'add'} | {mode:'edit',machine}
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ data: m }, { data: a }, { data: p }] = await Promise.all([
      supabase.from('factory_machines').select('*').order('name'),
      supabase.from('factory_machine_assignments').select('*').is('unassigned_at', null),
      supabase.from('factory_profiles').select('id, name'),
    ]);
    setMachines(m || []);
    setAssignments(a || []);
    setProfiles(p || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ name: '', description: '' }); setModal({ mode: 'add' }); }
  function openEdit(m) { setForm({ name: m.name, description: m.description || '' }); setModal({ mode: 'edit', machine: m }); }

  async function save() {
    if (!form.name.trim()) { toast('El nombre es requerido', 'error'); return; }
    setLoading(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('factory_machines').insert({ name: form.name.trim(), description: form.description.trim() });
      if (error) { toast(error.message, 'error'); } else { toast('Máquina creada', 'success'); setModal(null); load(); }
    } else {
      const { error } = await supabase.from('factory_machines').update({ name: form.name.trim(), description: form.description.trim() }).eq('id', modal.machine.id);
      if (error) { toast(error.message, 'error'); } else { toast('Máquina actualizada', 'success'); setModal(null); load(); }
    }
    setLoading(false);
  }

  async function toggleActive(m) {
    await supabase.from('factory_machines').update({ is_active: !m.is_active }).eq('id', m.id);
    load();
  }

  const getOperator = (machineId) => {
    const a = assignments.find(x => x.machine_id === machineId);
    if (!a) return null;
    return profiles.find(p => p.id === a.operator_id)?.name || 'Desconocido';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Máquinas ({machines.length})</div>
        <Btn onClick={openAdd}>+ Agregar Máquina</Btn>
      </div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui' }}>
          <thead>
            <tr style={{ background: C.bgEl }}>
              {['Nombre', 'Descripción', 'Estado', 'Operador actual', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machines.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? C.bgCard : C.bgMid, borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 14px', color: C.text, fontSize: 14, fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>{m.description || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: m.is_active ? '#1a3d2a' : '#2a1a1a',
                    color: m.is_active ? C.green : C.red,
                  }}>{m.is_active ? 'Activa' : 'Inactiva'}</span>
                </td>
                <td style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>{getOperator(m.id) || '—'}</td>
                <td style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
                  <Btn small onClick={() => openEdit(m)} color={C.accent}>Editar</Btn>
                  <Btn small onClick={() => toggleActive(m)} color={m.is_active ? C.red : C.green}>
                    {m.is_active ? 'Desactivar' : 'Activar'}
                  </Btn>
                </td>
              </tr>
            ))}
            {machines.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: C.muted }}>No hay máquinas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal.mode === 'add' ? 'Nueva Máquina' : 'Editar Máquina'}>
          <div style={{ marginBottom: 14 }}>
            <Label>Nombre</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Máquina 1" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <Label>Descripción (opcional)</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalles de la máquina..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} color={C.bgEl} style={{ color: C.muted }}>Cancelar</Btn>
            <Btn onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: Operators tab ──────────────────────────────────────────────────────
function OperatorsTab({ toast, currentUserId }) {
  const [profiles, setProfiles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [machines, setMachines] = useState([]);

  const load = useCallback(async () => {
    const [{ data: p }, { data: a }, { data: m }] = await Promise.all([
      supabase.from('factory_profiles').select('*').order('name'),
      supabase.from('factory_machine_assignments').select('*').is('unassigned_at', null),
      supabase.from('factory_machines').select('id, name'),
    ]);
    setProfiles(p || []);
    setAssignments(a || []);
    setMachines(m || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleRole(p) {
    if (p.id === currentUserId) { toast('No puedes cambiar tu propio rol', 'error'); return; }
    const newRole = p.role === 'admin' ? 'operator' : 'admin';
    await supabase.from('factory_profiles').update({ role: newRole }).eq('id', p.id);
    toast(`Rol cambiado a ${newRole}`, 'success');
    load();
  }

  async function toggleActive(p) {
    if (p.id === currentUserId) { toast('No puedes desactivar tu propia cuenta', 'error'); return; }
    await supabase.from('factory_profiles').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  }

  const getMachine = (opId) => {
    const a = assignments.find(x => x.operator_id === opId);
    if (!a) return null;
    return machines.find(m => m.id === a.machine_id)?.name || 'Desconocida';
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>Operadores ({profiles.length})</div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui' }}>
          <thead>
            <tr style={{ background: C.bgEl }}>
              {['Nombre', 'Email', 'Rol', 'Máquina actual', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? C.bgCard : C.bgMid, borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 14px', color: C.text, fontSize: 14, fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>{p.id}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: p.role === 'admin' ? '#1a2d4a' : C.bgEl,
                    color: p.role === 'admin' ? '#5b9bd5' : C.muted,
                  }}>{p.role === 'admin' ? 'Admin' : 'Operador'}</span>
                </td>
                <td style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>{getMachine(p.id) || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: p.is_active ? '#1a3d2a' : '#2a1a1a',
                    color: p.is_active ? C.green : C.red,
                  }}>{p.is_active ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
                  <Btn small onClick={() => toggleRole(p)} color={C.accent} style={{ opacity: p.id === currentUserId ? 0.4 : 1 }}>
                    {p.role === 'admin' ? '→ Operador' : '→ Admin'}
                  </Btn>
                  <Btn small onClick={() => toggleActive(p)} color={p.is_active ? C.red : C.green} style={{ opacity: p.id === currentUserId ? 0.4 : 1 }}>
                    {p.is_active ? 'Desactivar' : 'Activar'}
                  </Btn>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: C.muted }}>No hay usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN: Pause reasons tab ──────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: 'Rojo', value: '#E74C3C' },
  { label: 'Naranja', value: '#E67E22' },
  { label: 'Amarillo', value: '#F39C12' },
  { label: 'Verde', value: '#27AE60' },
  { label: 'Azul', value: '#3498DB' },
  { label: 'Morado', value: '#9B59B6' },
  { label: 'Turquesa', value: '#1ABC9C' },
  { label: 'Gris', value: '#95A5A6' },
];

function PauseReasonsTab({ toast }) {
  const [reasons, setReasons] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#F39C12' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('factory_pause_reasons').select('*').order('name');
    setReasons(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ name: '', color: '#F39C12' }); setModal({ mode: 'add' }); }
  function openEdit(r) { setForm({ name: r.name, color: r.color }); setModal({ mode: 'edit', reason: r }); }

  async function save() {
    if (!form.name.trim()) { toast('El nombre es requerido', 'error'); return; }
    setLoading(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('factory_pause_reasons').insert({ name: form.name.trim(), color: form.color });
      if (error) { toast(error.message, 'error'); } else { toast('Razón creada', 'success'); setModal(null); load(); }
    } else {
      const { error } = await supabase.from('factory_pause_reasons').update({ name: form.name.trim(), color: form.color }).eq('id', modal.reason.id);
      if (error) { toast(error.message, 'error'); } else { toast('Razón actualizada', 'success'); setModal(null); load(); }
    }
    setLoading(false);
  }

  async function toggleActive(r) {
    await supabase.from('factory_pause_reasons').update({ is_active: !r.is_active }).eq('id', r.id);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Catálogo de Pausas ({reasons.length})</div>
        <Btn onClick={openAdd}>+ Agregar Razón</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reasons.map(r => (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: C.bgCard, borderRadius: 10, padding: '12px 16px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: r.color, flexShrink: 0 }} />
            <div style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: 600 }}>{r.name}</div>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: r.is_active ? '#1a3d2a' : '#2a1a1a',
              color: r.is_active ? C.green : C.red,
            }}>{r.is_active ? 'Activa' : 'Inactiva'}</span>
            <Btn small onClick={() => openEdit(r)} color={C.accent}>Editar</Btn>
            <Btn small onClick={() => toggleActive(r)} color={r.is_active ? C.red : C.green}>
              {r.is_active ? 'Desactivar' : 'Activar'}
            </Btn>
          </div>
        ))}
        {reasons.length === 0 && <div style={{ color: C.muted, textAlign: 'center', padding: 24 }}>No hay razones de pausa</div>}
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal.mode === 'add' ? 'Nueva Razón de Pausa' : 'Editar Razón'}>
          <div style={{ marginBottom: 14 }}>
            <Label>Nombre</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Mantenimiento" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <Label>Color</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(pc => (
                <button key={pc.value} onClick={() => setForm(f => ({ ...f, color: pc.value }))}
                  title={pc.label}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: pc.value, border: 'none', cursor: 'pointer',
                    outline: form.color === pc.value ? `3px solid #fff` : 'none',
                    transform: form.color === pc.value ? 'scale(1.15)' : 'none',
                    transition: 'transform 0.1s',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setModal(null)} color={C.bgEl} style={{ color: C.muted }}>Cancelar</Btn>
            <Btn onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ADMIN: Reports tab ────────────────────────────────────────────────────────
function fmtMins(mins) {
  if (!mins && mins !== 0) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function ReportsTab({ toast }) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [groupBy, setGroupBy] = useState('machine'); // 'machine' | 'operator'
  const [machines, setMachines] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pauses, setPauses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('factory_machines').select('id,name').then(({ data }) => setMachines(data || []));
    supabase.from('factory_profiles').select('id,name').then(({ data }) => setProfiles(data || []));
  }, []);

  async function loadReport() {
    setLoading(true);
    const fromDt = from + 'T00:00:00';
    const toDt = to + 'T23:59:59';
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('factory_sessions').select('*').gte('started_at', fromDt).lte('started_at', toDt),
      supabase.from('factory_pauses').select('*').gte('started_at', fromDt).lte('started_at', toDt),
    ]);
    setSessions(s || []);
    setPauses(p || []);
    setLoading(false);
  }

  // Compute rows
  const rows = React.useMemo(() => {
    const map = {};
    const now = Date.now();
    sessions.forEach(s => {
      const key = groupBy === 'machine' ? s.machine_id : s.operator_id;
      if (!map[key]) map[key] = { key, active_ms: 0, pause_ms: 0, pause_count: 0 };
      const end = s.ended_at ? new Date(s.ended_at).getTime() : now;
      const sessionMs = end - new Date(s.started_at).getTime();
      const sessPauses = pauses.filter(p => p.session_id === s.id);
      let pauseMs = 0;
      sessPauses.forEach(p => {
        const pe = p.ended_at ? new Date(p.ended_at).getTime() : now;
        pauseMs += pe - new Date(p.started_at).getTime();
        map[key].pause_count++;
      });
      map[key].active_ms += Math.max(0, sessionMs - pauseMs);
      map[key].pause_ms += pauseMs;
    });
    return Object.values(map).map(r => ({
      ...r,
      label: groupBy === 'machine'
        ? (machines.find(m => m.id === r.key)?.name || r.key)
        : (profiles.find(p => p.id === r.key)?.name || r.key),
      active_mins: r.active_ms / 60000,
      pause_mins: r.pause_ms / 60000,
    })).sort((a, b) => b.active_mins - a.active_mins);
  }, [sessions, pauses, groupBy, machines, profiles]);

  // Pause reason breakdown
  const reasonBreakdown = React.useMemo(() => {
    const map = {};
    pauses.forEach(p => {
      const name = p.reason_name || 'Otro';
      if (!map[name]) map[name] = 0;
      const now = Date.now();
      const end = p.ended_at ? new Date(p.ended_at).getTime() : now;
      map[name] += (end - new Date(p.started_at).getTime()) / 60000;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map).map(([name, mins]) => ({
      name, mins: Math.round(mins), pct: total > 0 ? Math.round((mins / total) * 100) : 0,
    })).sort((a, b) => b.mins - a.mins);
  }, [pauses]);

  const totalActive = rows.reduce((a, r) => a + r.active_mins, 0);
  const totalPauses = rows.reduce((a, r) => a + r.pause_count, 0);
  const totalPauseMins = rows.reduce((a, r) => a + r.pause_mins, 0);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>Reportes</div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <Label>Desde</Label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 160 }} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 160 }} />
        </div>
        <div>
          <Label>Agrupar por</Label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: C.bgEl, color: C.text, fontSize: 13, outline: 'none' }}>
            <option value="machine">Máquina</option>
            <option value="operator">Operador</option>
          </select>
        </div>
        <Btn onClick={loadReport} disabled={loading}>{loading ? 'Cargando...' : 'Generar reporte'}</Btn>
      </div>

      {sessions.length > 0 && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Tiempo activo total', value: fmtMins(totalActive), color: C.green },
              { label: 'Total pausas', value: totalPauses, color: C.yellow },
              { label: 'Tiempo en pausa total', value: fmtMins(totalPauseMins), color: C.red },
              { label: 'Promedio pausa', value: totalPauses > 0 ? fmtMins(totalPauseMins / totalPauses) : '—', color: C.muted },
            ].map(card => (
              <div key={card.label} style={{ background: C.bgCard, borderRadius: 10, padding: '16px 18px', border: `1px solid ${C.border}` }}>
                <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{card.label}</div>
                <div style={{ color: card.color, fontSize: 24, fontWeight: 800 }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui' }}>
              <thead>
                <tr style={{ background: C.bgEl }}>
                  {[groupBy === 'machine' ? 'Máquina' : 'Operador', 'Tiempo activo', '# Pausas', 'Tiempo en pausa'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.key} style={{ background: i % 2 === 0 ? C.bgCard : C.bgMid, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 14px', color: C.text, fontWeight: 600, fontSize: 14 }}>{r.label}</td>
                    <td style={{ padding: '12px 14px', color: C.green, fontSize: 14 }}>{fmtMins(r.active_mins)}</td>
                    <td style={{ padding: '12px 14px', color: C.yellow, fontSize: 14 }}>{r.pause_count}</td>
                    <td style={{ padding: '12px 14px', color: C.red, fontSize: 14 }}>{fmtMins(r.pause_mins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reason breakdown chart */}
          {reasonBreakdown.length > 0 && (
            <div style={{ background: C.bgCard, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>Desglose de razones de pausa</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reasonBreakdown} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 12 }} width={130} />
                  <Tooltip
                    formatter={(v) => [`${Math.round(v)} min`, 'Duración']}
                    contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                  />
                  <Bar dataKey="mins" radius={[0, 4, 4, 0]}>
                    {reasonBreakdown.map((entry, idx) => (
                      <Cell key={idx} fill={C.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {reasonBreakdown.map(r => (
                  <div key={r.name} style={{ fontSize: 12, color: C.muted }}>
                    <span style={{ color: C.text, fontWeight: 600 }}>{r.name}</span>: {fmtMins(r.mins)} ({r.pct}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {sessions.length === 0 && !loading && (
        <div style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Selecciona un rango de fechas y genera el reporte.</div>
      )}
    </div>
  );
}

// ─── OPERATOR: Pause modal ─────────────────────────────────────────────────────
function PauseModal({ onClose, onConfirm }) {
  const [reasons, setReasons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    supabase.from('factory_pause_reasons').select('*').eq('is_active', true).order('name').then(({ data }) => setReasons(data || []));
  }, []);

  return (
    <Modal onClose={onClose} title="Seleccionar razón de pausa" width={460}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        {reasons.map(r => (
          <button key={r.id} onClick={() => setSelected(r)}
            style={{
              padding: '12px 14px', borderRadius: 8, border: `2px solid ${selected?.id === r.id ? r.color : C.border}`,
              background: selected?.id === r.id ? r.color + '22' : C.bgEl,
              color: C.text, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'system-ui',
            }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: r.color, display: 'inline-block', flexShrink: 0 }} />
            {r.name}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Label>Notas (opcional)</Label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Detalles adicionales..."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
            background: C.bgEl, color: C.text, fontSize: 13, outline: 'none', resize: 'vertical',
            fontFamily: 'system-ui', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} color={C.bgEl} style={{ color: C.muted }}>Cancelar</Btn>
        <Btn onClick={() => { if (selected) onConfirm(selected, notes); }} disabled={!selected} color={C.yellow}>
          Confirmar pausa
        </Btn>
      </div>
    </Modal>
  );
}

// ─── OPERATOR: Machine card ────────────────────────────────────────────────────
function MachineCard({ machine, operatorId, toast, onUnassigned }) {
  const [session, setSession] = useState(null);
  const [activePause, setActivePause] = useState(null);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSessionData = useCallback(async () => {
    const { data: s } = await supabase
      .from('factory_sessions')
      .select('*')
      .eq('machine_id', machine.id)
      .is('ended_at', null)
      .maybeSingle();

    setSession(s || null);
    if (s) {
      const { data: p } = await supabase
        .from('factory_pauses')
        .select('*')
        .eq('session_id', s.id)
        .is('ended_at', null)
        .maybeSingle();
      setActivePause(p || null);

      // calc total past pauses
      const { data: allPauses } = await supabase
        .from('factory_pauses')
        .select('*')
        .eq('session_id', s.id)
        .not('ended_at', 'is', null);
      const ms = (allPauses || []).reduce((sum, pp) => {
        return sum + (new Date(pp.ended_at).getTime() - new Date(pp.started_at).getTime());
      }, 0);
      setTotalPausedMs(ms);
    } else {
      setActivePause(null);
      setTotalPausedMs(0);
    }
  }, [machine.id]);

  useEffect(() => { loadSessionData(); }, [loadSessionData]);

  async function startSession() {
    setLoading(true);
    const { error } = await supabase.from('factory_sessions').insert({
      machine_id: machine.id,
      operator_id: operatorId,
    });
    if (error) toast(error.message, 'error');
    else { toast('Turno iniciado', 'success'); await loadSessionData(); }
    setLoading(false);
  }

  async function endSession() {
    if (!session) return;
    setLoading(true);
    // Close any open pause first
    if (activePause) {
      await supabase.from('factory_pauses').update({ ended_at: new Date().toISOString() }).eq('id', activePause.id);
    }
    const { error } = await supabase.from('factory_sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id);
    if (error) toast(error.message, 'error');
    else { toast('Turno terminado', 'success'); await loadSessionData(); }
    setLoading(false);
  }

  async function startPause(reason, notes) {
    if (!session) return;
    setLoading(true);
    const { error } = await supabase.from('factory_pauses').insert({
      session_id: session.id,
      reason_id: reason.id,
      reason_name: reason.name,
      notes: notes || null,
    });
    if (error) toast(error.message, 'error');
    else { toast('Pausa iniciada', 'success'); setShowPauseModal(false); await loadSessionData(); }
    setLoading(false);
  }

  async function resumeSession() {
    if (!activePause) return;
    setLoading(true);
    const { error } = await supabase.from('factory_pauses').update({ ended_at: new Date().toISOString() }).eq('id', activePause.id);
    if (error) toast(error.message, 'error');
    else { toast('Sesión reanudada', 'success'); await loadSessionData(); }
    setLoading(false);
  }

  async function unassign() {
    setLoading(true);
    // End active session if any
    if (session) {
      if (activePause) await supabase.from('factory_pauses').update({ ended_at: new Date().toISOString() }).eq('id', activePause.id);
      await supabase.from('factory_sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id);
    }
    const { error } = await supabase
      .from('factory_machine_assignments')
      .update({ unassigned_at: new Date().toISOString() })
      .eq('machine_id', machine.id)
      .eq('operator_id', operatorId)
      .is('unassigned_at', null);
    if (error) toast(error.message, 'error');
    else { toast(`Desasignado de ${machine.name}`, 'success'); onUnassigned(); }
    setLoading(false);
  }

  const statusColor = !session ? C.muted : activePause ? C.yellow : C.green;
  const statusLabel = !session ? 'Sin sesión' : activePause ? `En pausa: ${activePause.reason_name}` : 'Turno activo';

  return (
    <div style={{
      background: C.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${statusColor}`, position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{machine.name}</div>
          <div style={{ fontSize: 12, color: statusColor, marginTop: 4, fontWeight: 600 }}>{statusLabel}</div>
        </div>
        <button onClick={unassign} disabled={loading}
          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', color: C.muted, cursor: 'pointer', fontSize: 11, fontFamily: 'system-ui' }}>
          Desasignar
        </button>
      </div>

      {/* Timers */}
      {session && (
        <div style={{ marginBottom: 14 }}>
          {activePause ? (
            <div style={{ fontSize: 13, color: C.yellow }}>
              Pausa: <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}><PauseTimer startedAt={activePause.started_at} /></span>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.green }}>
              Tiempo activo: <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>
                <ElapsedTimer startedAt={session.started_at} pausedSince={null} totalPausedMs={totalPausedMs} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!session && (
          <Btn onClick={startSession} disabled={loading} color={C.green} small>Iniciar turno</Btn>
        )}
        {session && !activePause && (
          <>
            <Btn onClick={() => setShowPauseModal(true)} disabled={loading} color={C.yellow} small>Pausar</Btn>
            <Btn onClick={endSession} disabled={loading} color={C.red} small>Terminar turno</Btn>
          </>
        )}
        {session && activePause && (
          <>
            <Btn onClick={resumeSession} disabled={loading} color={C.green} small>Reanudar</Btn>
            <Btn onClick={endSession} disabled={loading} color={C.red} small>Terminar turno</Btn>
          </>
        )}
      </div>

      {showPauseModal && <PauseModal onClose={() => setShowPauseModal(false)} onConfirm={startPause} />}
    </div>
  );
}

// ─── OPERATOR panel ────────────────────────────────────────────────────────────
function OperatorPanel({ user, toast }) {
  const [myAssignments, setMyAssignments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [loadingAssign, setLoadingAssign] = useState(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    const [{ data: allMachines }, { data: allAssignments }] = await Promise.all([
      supabase.from('factory_machines').select('*').eq('is_active', true).order('name'),
      supabase.from('factory_machine_assignments').select('*').is('unassigned_at', null),
    ]);

    const mList = allMachines || [];
    const aList = allAssignments || [];

    const mine = aList.filter(a => a.operator_id === user.id);
    const myMachineIds = mine.map(a => a.machine_id);
    const assignedToOthers = aList.filter(a => a.operator_id !== user.id).map(a => a.machine_id);

    setMachines(mList);
    setMyAssignments(mList.filter(m => myMachineIds.includes(m.id)));
    setAvailableMachines(mList.filter(m => !myMachineIds.includes(m.id) && !assignedToOthers.includes(m.id)));
  }, [user.id]);

  useEffect(() => { load(); }, [load, tick]);

  async function assign(machine) {
    setLoadingAssign(machine.id);
    const { error } = await supabase.from('factory_machine_assignments').insert({
      machine_id: machine.id,
      operator_id: user.id,
    });
    if (error) toast(error.message, 'error');
    else { toast(`Asignado a ${machine.name}`, 'success'); load(); }
    setLoadingAssign(null);
  }

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* My machines */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          Mis máquinas asignadas {myAssignments.length > 0 && `(${myAssignments.length})`}
        </div>
        {myAssignments.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 14 }}>No tienes máquinas asignadas. Asigna una abajo.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {myAssignments.map(m => (
              <MachineCard
                key={m.id}
                machine={m}
                operatorId={user.id}
                toast={toast}
                onUnassigned={() => setTick(t => t + 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Available machines */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          Asignar máquina {availableMachines.length > 0 && `(${availableMachines.length} disponibles)`}
        </div>
        {availableMachines.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 14 }}>No hay máquinas disponibles en este momento.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {availableMachines.map(m => (
              <button key={m.id}
                onClick={() => assign(m)}
                disabled={loadingAssign === m.id}
                style={{
                  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '14px 16px', cursor: 'pointer', textAlign: 'left', color: C.text,
                  fontSize: 14, fontWeight: 600, fontFamily: 'system-ui',
                  transition: 'border-color 0.15s',
                  opacity: loadingAssign === m.id ? 0.5 : 1,
                }}>
                <div style={{ marginBottom: 4 }}>⚙ {m.name}</div>
                <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Disponible — click para asignar</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN panel ───────────────────────────────────────────────────────────────
const ADMIN_TABS = [
  { id: 'machines', label: 'Máquinas' },
  { id: 'operators', label: 'Operadores' },
  { id: 'reasons', label: 'Catálogo de Pausas' },
  { id: 'reports', label: 'Reportes' },
];

function AdminPanel({ user, toast }) {
  const [tab, setTab] = useState('machines');

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {ADMIN_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 18px', fontSize: 14, fontWeight: 600, fontFamily: 'system-ui',
              color: tab === t.id ? C.text : C.muted,
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'machines' && <MachinesTab toast={toast} />}
      {tab === 'operators' && <OperatorsTab toast={toast} currentUserId={user.id} />}
      {tab === 'reasons' && <PauseReasonsTab toast={toast} />}
      {tab === 'reports' && <ReportsTab toast={toast} />}
    </div>
  );
}

// ─── Main FactoryOS component ──────────────────────────────────────────────────
export default function FactoryOS({ user, onLogout }) {
  const { toasts, add: toast } = useToasts();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui', color: C.text }}>
      <Toasts toasts={toasts} />

      {/* Header */}
      <div style={{
        background: C.bgMid, borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>⚙ PanelControl</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, color: C.muted }}>{user.name || user.email}</div>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: user.role === 'admin' ? '#1a2d4a' : C.bgEl,
            color: user.role === 'admin' ? '#5b9bd5' : C.muted,
          }}>{user.role === 'admin' ? 'Admin' : 'Operador'}</span>
          <button onClick={onLogout} style={{
            background: 'none', border: `1px solid ${C.border}`, borderRadius: 6,
            padding: '5px 12px', color: C.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
          }}>Cerrar sesión</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
        {user.role === 'admin'
          ? <AdminPanel user={user} toast={toast} />
          : <OperatorPanel user={user} toast={toast} />
        }
      </div>
    </div>
  );
}
