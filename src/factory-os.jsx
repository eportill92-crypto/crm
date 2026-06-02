import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const C = {
  bg: '#0C0E14', bgMid: '#14161E', bgCard: '#1C2030', bgEl: '#1E2235',
  accent: '#1D6FA4', accentHover: '#155d8a',
  green: '#27AE60', greenBg: 'rgba(39,174,96,0.12)',
  yellow: '#F39C12', yellowBg: 'rgba(243,156,18,0.12)',
  red: '#E74C3C', redBg: 'rgba(231,76,60,0.12)',
  text: '#F0F1F5', muted: '#8B8FA8', border: '#2A2D3E',
};

function minutesBetween(start, end) {
  return (new Date(end || new Date()) - new Date(start)) / 60000;
}

function formatHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Toast System
function ToastContainer({ toasts }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:8, zIndex:9999 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? C.green : t.type === 'error' ? C.red : C.accent,
          color:'#fff', padding:'10px 18px', borderRadius:8, fontSize:13, fontWeight:500,
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)', maxWidth:320, opacity:t.fading?0:1,
          transition:'opacity 0.3s'
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// Spinner
function Spinner({ size=20 }) {
  return (
    <div style={{
      width:size, height:size, border:`2px solid ${C.border}`,
      borderTopColor: C.accent, borderRadius:'50%',
      animation:'spin 0.7s linear infinite', display:'inline-block'
    }} />
  );
}

// Inline keyframes via style tag
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
`;
document.head.appendChild(styleTag);

// PulsingDot
function PulsingDot({ color }) {
  return (
    <span style={{
      width:8, height:8, borderRadius:'50%', background:color,
      display:'inline-block', marginRight:6,
      animation:'pulse 1.5s ease-in-out infinite'
    }} />
  );
}

// Live timer hook
function useLiveTimer(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

// ========== MACHINE CARD ==========
function MachineCard({ machine, assignment, activeSession, activePause, onAction, user }) {
  const sessionElapsed = useLiveTimer(activeSession?.started_at || null);
  const pauseElapsed = useLiveTimer(activePause?.started_at || null);

  const status = !activeSession ? 'none' : activePause ? 'paused' : 'active';

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 20, display:'flex', flexDirection:'column', gap:14,
      position:'relative'
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{machine.name}</div>
        {status === 'none' && (
          <span style={{ background:C.bgEl, color:C.muted, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Sin sesión
          </span>
        )}
        {status === 'active' && (
          <span style={{ background:C.greenBg, color:C.green, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, display:'flex', alignItems:'center' }}>
            <PulsingDot color={C.green} />Activa
          </span>
        )}
        {status === 'paused' && (
          <span style={{ background:C.yellowBg, color:C.yellow, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
            En pausa
          </span>
        )}
      </div>

      {status === 'active' && (
        <div style={{ background:C.bgEl, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ color:C.muted, fontSize:11, marginBottom:2 }}>Tiempo de sesión</div>
          <div style={{ fontFamily:'monospace', fontSize:22, fontWeight:700, color:C.green }}>{formatHMS(sessionElapsed)}</div>
        </div>
      )}

      {status === 'paused' && (
        <div style={{ background:C.bgEl, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ color:C.muted, fontSize:11, marginBottom:2 }}>Motivo: <span style={{ color:C.yellow }}>{activePause.reason_name}</span></div>
          <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:C.yellow }}>{formatHMS(pauseElapsed)}</div>
          {activePause.notes && <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>{activePause.notes}</div>}
        </div>
      )}

      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {status === 'none' && (
          <button onClick={() => onAction('start', machine, assignment, activeSession, activePause)} style={btnStyle(C.green)}>
            ▶ Iniciar turno
          </button>
        )}
        {status === 'active' && (<>
          <button onClick={() => onAction('pause', machine, assignment, activeSession, activePause)} style={btnStyle(C.yellow)}>
            ⏸ Pausar
          </button>
          <button onClick={() => onAction('end', machine, assignment, activeSession, activePause)} style={btnOutlineStyle(C.red)}>
            ⏹ Terminar turno
          </button>
        </>)}
        {status === 'paused' && (<>
          <button onClick={() => onAction('resume', machine, assignment, activeSession, activePause)} style={btnStyle(C.green)}>
            ▶ Reanudar
          </button>
          <button onClick={() => onAction('end', machine, assignment, activeSession, activePause)} style={btnOutlineStyle(C.red)}>
            ⏹ Terminar turno
          </button>
        </>)}
      </div>

      <div style={{ textAlign:'right', marginTop:-4 }}>
        <button onClick={() => onAction('unassign', machine, assignment, activeSession, activePause)}
          style={{ background:'none', border:'none', color:C.muted, fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
          Desasignar
        </button>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    background: color, color:'#fff', border:'none', borderRadius:8,
    padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer'
  };
}
function btnOutlineStyle(color) {
  return {
    background:'transparent', color:color, border:`1px solid ${color}`, borderRadius:8,
    padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer'
  };
}

// ========== PAUSE MODAL ==========
function PauseModal({ machine, onConfirm, onCancel }) {
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('factory_pause_reasons').select('*').eq('is_active', true)
      .then(({ data }) => data && setReasons(data));
  }, []);

  async function handleConfirm() {
    if (!selectedReason) return;
    setLoading(true);
    await onConfirm(selectedReason, notes);
    setLoading(false);
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:1000, padding:16
    }}>
      <div style={{
        background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16,
        padding:28, width:'100%', maxWidth:440
      }}>
        <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>Seleccionar motivo de pausa</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:20 }}>{machine.name}</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
          {reasons.map(r => (
            <button key={r.id} onClick={() => setSelectedReason(r)} style={{
              background: selectedReason?.id === r.id ? r.color : C.bgEl,
              border: `2px solid ${selectedReason?.id === r.id ? r.color : C.border}`,
              color: selectedReason?.id === r.id ? '#fff' : C.text,
              borderRadius:8, padding:'10px 12px', cursor:'pointer',
              fontSize:13, fontWeight:600, textAlign:'left',
              display:'flex', alignItems:'center', gap:8
            }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:r.color, flexShrink:0 }} />
              {r.name}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', color:C.muted, fontSize:12, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Notas adicionales (opcional)
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Detalles adicionales..."
            rows={3}
            style={{
              width:'100%', background:C.bgEl, border:`1px solid ${C.border}`,
              borderRadius:8, padding:'10px 14px', color:C.text, fontSize:13,
              resize:'vertical', outline:'none'
            }}
          />
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleConfirm} disabled={!selectedReason || loading} style={{
            flex:1, background: selectedReason ? C.yellow : C.bgEl,
            color: selectedReason ? '#fff' : C.muted,
            border:'none', borderRadius:8, padding:'11px 0',
            fontSize:14, fontWeight:600, cursor: selectedReason ? 'pointer' : 'not-allowed'
          }}>
            {loading ? 'Procesando...' : 'Confirmar pausa'}
          </button>
          <button onClick={onCancel} style={{
            padding:'11px 20px', background:'transparent', border:`1px solid ${C.border}`,
            borderRadius:8, color:C.muted, fontSize:13, cursor:'pointer'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== OPERATOR VIEW ==========
function OperatorView({ user, showToast }) {
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pauses, setPauses] = useState([]);
  const [allMachines, setAllMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(null);
  const [showAvailable, setShowAvailable] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [assignRes, machinesRes] = await Promise.all([
      supabase.from('factory_machine_assignments')
        .select('*, factory_machines(*)')
        .eq('operator_id', user.id)
        .is('unassigned_at', null),
      supabase.from('factory_machines').select('*').eq('is_active', true)
    ]);
    const myAssignments = assignRes.data || [];
    const allM = machinesRes.data || [];
    setAssignments(myAssignments);
    setAllMachines(allM);

    if (myAssignments.length > 0) {
      const machineIds = myAssignments.map(a => a.machine_id);
      const [sessRes] = await Promise.all([
        supabase.from('factory_sessions').select('*')
          .in('machine_id', machineIds).is('ended_at', null)
      ]);
      const activeSessions = sessRes.data || [];
      setSessions(activeSessions);
      if (activeSessions.length > 0) {
        const sessionIds = activeSessions.map(s => s.id);
        const pRes = await supabase.from('factory_pauses').select('*')
          .in('session_id', sessionIds).is('ended_at', null);
        setPauses(pRes.data || []);
      } else {
        setPauses([]);
      }
    } else {
      setSessions([]);
      setPauses([]);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Machines already assigned (to anyone)
  const [allAssigned, setAllAssigned] = useState([]);
  useEffect(() => {
    supabase.from('factory_machine_assignments').select('machine_id')
      .is('unassigned_at', null)
      .then(({ data }) => setAllAssigned((data || []).map(a => a.machine_id)));
  }, [assignments]);

  const myMachineIds = assignments.map(a => a.machine_id);
  const availableMachines = allMachines.filter(m => !allAssigned.includes(m.id));

  async function handleAction(action, machine, assignment, activeSession, activePause) {
    if (action === 'start') {
      const { error } = await supabase.from('factory_sessions').insert({
        machine_id: machine.id, operator_id: user.id, started_at: new Date().toISOString()
      });
      if (error) { showToast('Error al iniciar sesión', 'error'); return; }
      showToast('Turno iniciado', 'success');
      loadData();
    } else if (action === 'pause') {
      setShowPauseModal({ machine, assignment, activeSession, activePause });
    } else if (action === 'resume') {
      const { error } = await supabase.from('factory_pauses')
        .update({ ended_at: new Date().toISOString() }).eq('id', activePause.id);
      if (error) { showToast('Error al reanudar', 'error'); return; }
      showToast('Turno reanudado', 'success');
      loadData();
    } else if (action === 'end') {
      const now = new Date().toISOString();
      if (activePause) {
        await supabase.from('factory_pauses').update({ ended_at: now }).eq('id', activePause.id);
      }
      const { error } = await supabase.from('factory_sessions')
        .update({ ended_at: now }).eq('id', activeSession.id);
      if (error) { showToast('Error al terminar sesión', 'error'); return; }
      showToast('Turno terminado', 'success');
      loadData();
    } else if (action === 'unassign') {
      const { error } = await supabase.from('factory_machine_assignments')
        .update({ unassigned_at: new Date().toISOString() }).eq('id', assignment.id);
      if (error) { showToast('Error al desasignar', 'error'); return; }
      showToast('Máquina desasignada', 'info');
      loadData();
    }
  }

  async function handlePauseConfirm(reason, notes) {
    const { machine, activeSession } = showPauseModal;
    const { error } = await supabase.from('factory_pauses').insert({
      session_id: activeSession.id,
      reason_id: reason.id,
      reason_name: reason.name,
      notes: notes || null,
      started_at: new Date().toISOString()
    });
    if (error) { showToast('Error al pausar', 'error'); return; }
    setShowPauseModal(null);
    showToast('Sesión pausada', 'info');
    loadData();
  }

  async function assignMachine(machineId) {
    const { error } = await supabase.from('factory_machine_assignments').insert({
      machine_id: machineId, operator_id: user.id, assigned_at: new Date().toISOString()
    });
    if (error) { showToast('Error al asignar', 'error'); return; }
    showToast('Máquina asignada', 'success');
    loadData();
  }

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'0 16px 40px' }}>
      {showPauseModal && (
        <PauseModal
          machine={showPauseModal.machine}
          onConfirm={handlePauseConfirm}
          onCancel={() => setShowPauseModal(null)}
        />
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Mis Máquinas</div>
        {loading && <Spinner />}
      </div>

      {!loading && assignments.length === 0 && (
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:32, textAlign:'center', color:C.muted, marginBottom:24 }}>
          No tienes máquinas asignadas. Asigna una desde la sección de abajo.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16, marginBottom:32 }}>
        {assignments.map(a => {
          const machine = a.factory_machines;
          const activeSession = sessions.find(s => s.machine_id === machine.id) || null;
          const activePause = activeSession ? pauses.find(p => p.session_id === activeSession.id) || null : null;
          return (
            <MachineCard
              key={a.id}
              machine={machine}
              assignment={a}
              activeSession={activeSession}
              activePause={activePause}
              onAction={handleAction}
              user={user}
            />
          );
        })}
      </div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <button onClick={() => setShowAvailable(v => !v)} style={{
          width:'100%', background:'none', border:'none', padding:'14px 20px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          cursor:'pointer', color:C.text
        }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Asignar máquina</span>
          <span style={{ color:C.muted }}>{showAvailable ? '▲' : '▼'}</span>
        </button>

        {showAvailable && (
          <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${C.border}` }}>
            {availableMachines.length === 0 ? (
              <div style={{ color:C.muted, fontSize:13, padding:'16px 0', textAlign:'center' }}>
                No hay máquinas disponibles en este momento
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, paddingTop:16 }}>
                {availableMachines.map(m => (
                  <button key={m.id} onClick={() => assignMachine(m.id)} style={{
                    background:C.bgEl, border:`1px solid ${C.border}`, borderRadius:8,
                    padding:'12px 10px', cursor:'pointer', textAlign:'center',
                    transition:'border-color 0.2s'
                  }}>
                    <div style={{ color:C.text, fontSize:13, fontWeight:600, marginBottom:4 }}>{m.name}</div>
                    <div style={{ color:C.green, fontSize:11 }}>Disponible</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== ADMIN TABS ==========

// --- Machines Tab ---
function MachinesTab({ showToast }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', machine? }
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadMachines() {
    setLoading(true);
    const { data: mData } = await supabase.from('factory_machines').select('*').order('created_at');
    const { data: aData } = await supabase.from('factory_machine_assignments')
      .select('*, factory_profiles(name)').is('unassigned_at', null);
    const assignments = aData || [];
    const enriched = (mData || []).map(m => ({
      ...m,
      assignment: assignments.find(a => a.machine_id === m.id) || null
    }));
    setMachines(enriched);
    setLoading(false);
  }

  useEffect(() => { loadMachines(); }, []);

  function openAdd() { setFormName(''); setFormDesc(''); setModal({ mode:'add' }); }
  function openEdit(m) { setFormName(m.name); setFormDesc(m.description || ''); setModal({ mode:'edit', machine: m }); }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('factory_machines').insert({ name:formName.trim(), description:formDesc.trim()||null });
      if (error) { showToast('Error al crear', 'error'); } else { showToast('Máquina creada', 'success'); }
    } else {
      const { error } = await supabase.from('factory_machines').update({ name:formName.trim(), description:formDesc.trim()||null }).eq('id', modal.machine.id);
      if (error) { showToast('Error al actualizar', 'error'); } else { showToast('Máquina actualizada', 'success'); }
    }
    setSaving(false);
    setModal(null);
    loadMachines();
  }

  async function toggleActive(m) {
    await supabase.from('factory_machines').update({ is_active: !m.is_active }).eq('id', m.id);
    showToast(m.is_active ? 'Máquina desactivada' : 'Máquina activada', 'info');
    loadMachines();
  }

  const inputStyle = { width:'100%', background:C.bgEl, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', color:C.text, fontSize:13, outline:'none', marginTop:6 };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:16, color:C.text }}>Máquinas</div>
        <button onClick={openAdd} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Nueva máquina
        </button>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:32 }}><Spinner /></div> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ color:C.muted, borderBottom:`1px solid ${C.border}` }}>
                {['Nombre','Descripción','Estado','Operador asignado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'12px', color:C.text, fontWeight:600 }}>{m.name}</td>
                  <td style={{ padding:'12px', color:C.muted }}>{m.description || '—'}</td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ background: m.is_active ? C.greenBg : C.redBg, color: m.is_active ? C.green : C.red, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {m.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding:'12px', color:C.muted }}>{m.assignment?.factory_profiles?.name || '—'}</td>
                  <td style={{ padding:'12px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => openEdit(m)} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
                        ✏ Editar
                      </button>
                      <button onClick={() => toggleActive(m)} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
                        {m.is_active ? '👁 Desactivar' : '👁 Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:28, width:'100%', maxWidth:400 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:20 }}>
              {modal.mode === 'add' ? 'Nueva máquina' : 'Editar máquina'}
            </div>
            <label style={{ color:C.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Nombre</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} style={inputStyle} placeholder="Nombre de la máquina" />
            <label style={{ color:C.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginTop:14 }}>Descripción</label>
            <input value={formDesc} onChange={e => setFormDesc(e.target.value)} style={inputStyle} placeholder="Descripción opcional" />
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={handleSave} disabled={saving || !formName.trim()} style={{ flex:1, background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'10px 0', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(null)} style={{ padding:'10px 18px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Operators Tab ---
function OperatorsTab({ currentUser, showToast }) {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadOperators() {
    setLoading(true);
    const { data: profiles } = await supabase.from('factory_profiles').select('*').order('created_at');
    const { data: assignments } = await supabase.from('factory_machine_assignments')
      .select('*, factory_machines(name)').is('unassigned_at', null);
    const enriched = (profiles || []).map(p => ({
      ...p,
      assignment: (assignments || []).find(a => a.operator_id === p.id) || null
    }));
    setOperators(enriched);
    setLoading(false);
  }

  useEffect(() => { loadOperators(); }, []);

  async function toggleRole(op) {
    const newRole = op.role === 'admin' ? 'operator' : 'admin';
    const { error } = await supabase.from('factory_profiles').update({ role:newRole }).eq('id', op.id);
    if (error) { showToast('Error', 'error'); return; }
    showToast(`Rol cambiado a ${newRole}`, 'info');
    loadOperators();
  }

  async function toggleActive(op) {
    if (op.id === currentUser.id) { showToast('No puedes desactivarte a ti mismo', 'error'); return; }
    const { error } = await supabase.from('factory_profiles').update({ is_active: !op.is_active }).eq('id', op.id);
    if (error) { showToast('Error', 'error'); return; }
    showToast(op.is_active ? 'Usuario desactivado' : 'Usuario activado', 'info');
    loadOperators();
  }

  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:20 }}>Operadores</div>
      {loading ? <div style={{ textAlign:'center', padding:32 }}><Spinner /></div> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ color:C.muted, borderBottom:`1px solid ${C.border}` }}>
                {['Nombre','Email','Rol','Estado','Máquina actual','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map(op => (
                <tr key={op.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'12px', color:C.text, fontWeight:600 }}>
                    {op.name}
                    {op.id === currentUser.id && <span style={{ color:C.muted, fontSize:11, marginLeft:6 }}>(tú)</span>}
                  </td>
                  <td style={{ padding:'12px', color:C.muted }}>{op.email || '—'}</td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ background: op.role === 'admin' ? 'rgba(29,111,164,0.15)' : C.bgEl, color: op.role === 'admin' ? C.accent : C.muted, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {op.role === 'admin' ? 'Admin' : 'Operador'}
                    </span>
                  </td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ background: op.is_active ? C.greenBg : C.redBg, color: op.is_active ? C.green : C.red, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {op.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding:'12px', color:C.muted }}>{op.assignment?.factory_machines?.name || '—'}</td>
                  <td style={{ padding:'12px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => toggleRole(op)} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
                        {op.role === 'admin' ? '→ Operador' : '→ Admin'}
                      </button>
                      <button onClick={() => toggleActive(op)} disabled={op.id === currentUser.id} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color: op.id === currentUser.id ? C.border : C.muted, borderRadius:6, padding:'5px 12px', cursor: op.id === currentUser.id ? 'not-allowed' : 'pointer', fontSize:12 }}>
                        {op.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Pause Reasons Tab ---
const PRESET_COLORS = ['#E74C3C','#F39C12','#27AE60','#3498DB','#9B59B6','#E67E22','#1ABC9C','#95A5A6'];

function PauseReasonsTab({ showToast }) {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function loadReasons() {
    setLoading(true);
    const { data } = await supabase.from('factory_pause_reasons').select('*').order('created_at');
    setReasons(data || []);
    setLoading(false);
  }

  useEffect(() => { loadReasons(); }, []);

  function openAdd() { setFormName(''); setFormColor(PRESET_COLORS[0]); setModal({ mode:'add' }); }
  function openEdit(r) { setFormName(r.name); setFormColor(r.color); setModal({ mode:'edit', reason:r }); }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    if (modal.mode === 'add') {
      const { error } = await supabase.from('factory_pause_reasons').insert({ name:formName.trim(), color:formColor });
      if (error) { showToast('Error al crear', 'error'); } else { showToast('Motivo creado', 'success'); }
    } else {
      const { error } = await supabase.from('factory_pause_reasons').update({ name:formName.trim(), color:formColor }).eq('id', modal.reason.id);
      if (error) { showToast('Error al actualizar', 'error'); } else { showToast('Motivo actualizado', 'success'); }
    }
    setSaving(false);
    setModal(null);
    loadReasons();
  }

  async function toggleActive(r) {
    await supabase.from('factory_pause_reasons').update({ is_active: !r.is_active }).eq('id', r.id);
    showToast(r.is_active ? 'Motivo desactivado' : 'Motivo activado', 'info');
    loadReasons();
  }

  const inputStyle = { width:'100%', background:C.bgEl, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', color:C.text, fontSize:13, outline:'none', marginTop:6 };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:16, color:C.text }}>Catálogo de Pausas</div>
        <button onClick={openAdd} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          + Nuevo motivo
        </button>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:32 }}><Spinner /></div> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ color:C.muted, borderBottom:`1px solid ${C.border}` }}>
                {['Color','Nombre','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reasons.map(r => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'12px' }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:r.color }} />
                  </td>
                  <td style={{ padding:'12px', color:C.text, fontWeight:600 }}>{r.name}</td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ background: r.is_active ? C.greenBg : C.redBg, color: r.is_active ? C.green : C.red, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {r.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding:'12px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => openEdit(r)} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
                        ✏ Editar
                      </button>
                      <button onClick={() => toggleActive(r)} style={{ background:C.bgEl, border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 }}>
                        {r.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:28, width:'100%', maxWidth:380 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:20 }}>
              {modal.mode === 'add' ? 'Nuevo motivo' : 'Editar motivo'}
            </div>
            <label style={{ color:C.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Nombre</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} style={inputStyle} placeholder="Nombre del motivo" />
            <label style={{ color:C.muted, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginTop:14, marginBottom:8 }}>Color</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setFormColor(c)} style={{
                  width:32, height:32, borderRadius:8, background:c, border: formColor === c ? '3px solid #fff' : '3px solid transparent',
                  cursor:'pointer', outline:'none'
                }} />
              ))}
            </div>
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:formColor }} />
              <span style={{ color:C.muted, fontSize:12 }}>Color seleccionado: {formColor}</span>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={handleSave} disabled={saving || !formName.trim()} style={{ flex:1, background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'10px 0', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(null)} style={{ padding:'10px 18px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Reports Tab ---
function ReportsTab() {
  const today = new Date().toISOString().slice(0,10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [filterMachine, setFilterMachine] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [machines, setMachines] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    supabase.from('factory_machines').select('id,name').eq('is_active',true).then(({ data }) => setMachines(data||[]));
    supabase.from('factory_profiles').select('id,name').then(({ data }) => setOperators(data||[]));
  }, []);

  async function runReport() {
    setLoading(true);
    const from = dateFrom + 'T00:00:00';
    const to = dateTo + 'T23:59:59';

    let sessQuery = supabase.from('factory_sessions')
      .select('*, factory_machines(name), factory_profiles(name)')
      .gte('started_at', from).lte('started_at', to);
    if (filterMachine) sessQuery = sessQuery.eq('machine_id', filterMachine);
    if (filterOperator) sessQuery = sessQuery.eq('operator_id', filterOperator);

    const { data: sessions } = await sessQuery;
    const sessIds = (sessions||[]).map(s => s.id);

    let pauseData = [];
    if (sessIds.length > 0) {
      const { data } = await supabase.from('factory_pauses').select('*').in('session_id', sessIds);
      pauseData = data || [];
    }

    // Compute metrics
    const sessionRows = (sessions||[]).map(s => {
      const sessActive = minutesBetween(s.started_at, s.ended_at);
      const myPauses = pauseData.filter(p => p.session_id === s.id);
      const totalPauseMins = myPauses.reduce((acc, p) => acc + minutesBetween(p.started_at, p.ended_at), 0);
      const realActive = Math.max(0, sessActive - totalPauseMins);
      const efficiency = sessActive > 0 ? (realActive / sessActive) * 100 : 0;
      return {
        key: s.id,
        label: `${s.factory_machines?.name || ''} / ${s.factory_profiles?.name || ''}`,
        activeMins: realActive,
        pauseCount: myPauses.length,
        pauseMins: totalPauseMins,
        efficiency: Math.round(efficiency)
      };
    });

    const totalActive = sessionRows.reduce((a,r) => a + r.activeMins, 0);
    const totalPauses = sessionRows.reduce((a,r) => a + r.pauseCount, 0);
    const totalPauseMins = sessionRows.reduce((a,r) => a + r.pauseMins, 0);
    const totalTime = totalActive + totalPauseMins;
    const overallEfficiency = totalTime > 0 ? Math.round((totalActive / totalTime) * 100) : 0;

    // Reasons breakdown
    const reasonMap = {};
    pauseData.forEach(p => {
      const key = p.reason_name || 'Sin motivo';
      reasonMap[key] = (reasonMap[key] || 0) + minutesBetween(p.started_at, p.ended_at);
    });
    const reasonsChart = Object.entries(reasonMap).map(([name, mins]) => ({ name, mins: Math.round(mins) }));

    setResults({ sessionRows, totalActive, totalPauses, totalPauseMins, overallEfficiency, reasonsChart });
    setLoading(false);
  }

  const selectStyle = { background:C.bgEl, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:13, outline:'none' };
  const inputStyle = { ...selectStyle };

  function SummaryCard({ label, value, sub }) {
    return (
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 20px', flex:1, minWidth:120 }}>
        <div style={{ color:C.muted, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{label}</div>
        <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>{value}</div>
        {sub && <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{sub}</div>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:20 }}>Reportes</div>

      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:24 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>Desde</div>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>Hasta</div>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>Máquina</div>
            <select value={filterMachine} onChange={e => setFilterMachine(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color:C.muted, fontSize:11, marginBottom:4 }}>Operador</div>
            <select value={filterOperator} onChange={e => setFilterOperator(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <button onClick={runReport} disabled={loading} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign:'center', padding:40 }}><Spinner size={28} /></div>}

      {results && !loading && (
        <div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
            <SummaryCard label="Tiempo Activo Total" value={formatMinutes(results.totalActive)} />
            <SummaryCard label="Total Pausas" value={results.totalPauses} />
            <SummaryCard label="Tiempo en Pausa" value={formatMinutes(results.totalPauseMins)} />
            <SummaryCard label="Eficiencia" value={`${results.overallEfficiency}%`} />
          </div>

          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:24, overflowX:'auto' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, fontWeight:700, fontSize:14, color:C.text }}>Detalle por sesión</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ color:C.muted }}>
                  {['Máquina / Operador','Tiempo Activo','N° Pausas','Tiempo en Pausa','Eficiencia'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.sessionRows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:'20px 16px', color:C.muted, textAlign:'center' }}>No hay datos para el período seleccionado</td></tr>
                ) : (
                  results.sessionRows.map(r => (
                    <tr key={r.key} style={{ borderTop:`1px solid ${C.border}` }}>
                      <td style={{ padding:'12px 16px', color:C.text, fontWeight:500 }}>{r.label}</td>
                      <td style={{ padding:'12px 16px', color:C.green }}>{formatMinutes(r.activeMins)}</td>
                      <td style={{ padding:'12px 16px', color:C.text }}>{r.pauseCount}</td>
                      <td style={{ padding:'12px 16px', color:C.yellow }}>{formatMinutes(r.pauseMins)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ color: r.efficiency >= 80 ? C.green : r.efficiency >= 60 ? C.yellow : C.red, fontWeight:700 }}>
                          {r.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {results.reasonsChart.length > 0 && (
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:16 }}>Tiempo por motivo de pausa (minutos)</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={results.reasonsChart} margin={{ top:0, right:16, left:0, bottom:40 }}>
                  <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill:C.muted, fontSize:11 }} />
                  <Tooltip contentStyle={{ background:C.bgCard, border:`1px solid ${C.border}`, color:C.text }} />
                  <Bar dataKey="mins" radius={[4,4,0,0]}>
                    {results.reasonsChart.map((entry, i) => (
                      <Cell key={i} fill={PRESET_COLORS[i % PRESET_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== ADMIN VIEW ==========
const ADMIN_TABS = ['Máquinas','Operadores','Catálogo de Pausas','Reportes'];

function AdminView({ user, showToast }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 16px 40px' }}>
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:`1px solid ${C.border}`, flexWrap:'wrap' }}>
        {ADMIN_TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            background:'none', border:'none', padding:'10px 16px',
            cursor:'pointer', fontSize:13, fontWeight:600,
            color: activeTab === i ? C.text : C.muted,
            borderBottom: activeTab === i ? `2px solid ${C.accent}` : '2px solid transparent',
            marginBottom:-1
          }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <MachinesTab showToast={showToast} />}
      {activeTab === 1 && <OperatorsTab currentUser={user} showToast={showToast} />}
      {activeTab === 2 && <PauseReasonsTab showToast={showToast} />}
      {activeTab === 3 && <ReportsTab />}
    </div>
  );
}

// ========== MAIN FACTORY OS ==========
export default function FactoryOS({ user, onLogout }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  function showToast(msg, type='info') {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, msg, type, fading:false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fading:true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 2700);
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.bgMid, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ fontSize:18, fontWeight:700, color:C.text, letterSpacing:'-0.5px' }}>PanelControl</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{user.name}</span>
            <span style={{
              background: user.role === 'admin' ? 'rgba(29,111,164,0.2)' : C.bgCard,
              color: user.role === 'admin' ? C.accent : C.muted,
              padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600
            }}>
              {user.role === 'admin' ? 'Administrador' : 'Operador'}
            </span>
            <button onClick={onLogout} style={{
              background:'transparent', border:`1px solid ${C.border}`, color:C.muted,
              borderRadius:8, padding:'6px 14px', fontSize:12, cursor:'pointer', fontWeight:600
            }}>
              Salir
            </button>
          </div>
        </div>
      </div>

      <div style={{ paddingTop:24 }}>
        {user.role === 'admin'
          ? <AdminView user={user} showToast={showToast} />
          : <OperatorView user={user} showToast={showToast} />
        }
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
