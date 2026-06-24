import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Icons (inline SVG components to avoid extra deps) ───────────────────────
const Icon = ({ d, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IcHome       = ({s=20}) => <Icon size={s} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"/>;
const IcMsg        = ({s=20}) => <Icon size={s} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>;
const IcUsers      = ({s=20}) => <Icon size={s} d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]}/>;
const IcBell       = ({s=20}) => <Icon size={s} d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"]}/>;
const IcSearch     = ({s=20}) => <Icon size={s} d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.35-4.35"]}/>;
const IcSend       = ({s=18}) => <Icon size={s} d="M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z"/>;
const IcImg        = ({s=18}) => <Icon size={s} d={["M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z","M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]}/>;
const IcThumb      = ({s=18}) => <Icon size={s} d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>;
const IcComment    = ({s=18}) => <Icon size={s} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>;
const IcShare      = ({s=18}) => <Icon size={s} d={["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8","M16 6l-4-4-4 4","M12 2v13"]}/>;
const IcPin        = ({s=18}) => <Icon size={s} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]}/>;
const IcHash       = ({s=18}) => <Icon size={s} d={["M4 9h16","M4 15h16","M10 3L8 21","M16 3l-2 18"]}/>;
const IcLogout     = ({s=18}) => <Icon size={s} d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"]}/>;
const IcPlus       = ({s=18}) => <Icon size={s} d={["M12 5v14","M5 12h14"]}/>;
const IcX          = ({s=16}) => <Icon size={s} d={["M18 6L6 18","M6 6l12 12"]}/>;
const IcCheck      = ({s=16}) => <Icon size={s} d="M20 6L9 17l-5-5"/>;
const IcCalendar   = ({s=20}) => <Icon size={s} d={["M8 2v4","M16 2v4","M3 10h18","M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"]}/>;
const IcMail       = ({s=18}) => <Icon size={s} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]}/>;
const IcStar       = ({s=18}) => <Icon size={s} fill="currentColor" stroke="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#0F1117',
  bgCard:     '#1A1D26',
  bgInput:    '#242735',
  bgSidebar:  '#13151F',
  bgHover:    '#1F2235',
  accent:     '#6366F1',
  accentHover:'#4F52D9',
  accentLight:'rgba(99,102,241,0.12)',
  text:       '#F0F1F8',
  textSub:    '#8B8FA8',
  border:     '#2A2D3E',
  success:    '#22C55E',
  danger:     '#EF4444',
  warning:    '#F59E0B',
  online:     '#22C55E',
  away:       '#F59E0B',
  offline:    '#6B7280',
};
const F = { body: "'Inter', 'DM Sans', sans-serif", head: "'Syne', 'Inter', sans-serif" };
const R = '12px';

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: ${F.body}; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes toastIn  { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideIn  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  button { cursor: pointer; }
  input, textarea { outline: none; }
  a { color: inherit; text-decoration: none; }
`;

function injectGlobal() {
  if (!document.getElementById('ws-global')) {
    const s = document.createElement('style');
    s.id = 'ws-global';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
  return `hace ${Math.floor(diff/86400)}d`;
}

function avatar(name, size = 36) {
  const initials = name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?';
  const colors = ['#6366F1','#8B5CF6','#EC4899','#14B8A6','#F59E0B','#22C55E','#3B82F6','#EF4444'];
  const bg = colors[name?.charCodeAt(0) % colors.length || 0];
  return { initials, bg, size };
}

function Avatar({ name, src, size=36, online }) {
  const av = avatar(name, size);
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      {src
        ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover' }}/>
        : <div style={{ width:size, height:size, borderRadius:'50%', background:av.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:700, color:'#fff', flexShrink:0 }}>{av.initials}</div>
      }
      {online !== undefined && (
        <span style={{ position:'absolute', bottom:1, right:1, width:size*0.28, height:size*0.28, borderRadius:'50%', background: online==='online'?C.online:online==='away'?C.away:C.offline, border:`2px solid ${C.bgCard}` }}/>
      )}
    </div>
  );
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:'u1', name:'Ana Martínez',   role:'CEO',              dept:'Dirección',   email:'ana@empresa.com',    status:'online',  avatar:null },
  { id:'u2', name:'Carlos Ruiz',    role:'CTO',              dept:'Tecnología',  email:'carlos@empresa.com', status:'online',  avatar:null },
  { id:'u3', name:'Laura Sánchez',  role:'Diseño UX',        dept:'Producto',    email:'laura@empresa.com',  status:'away',    avatar:null },
  { id:'u4', name:'Miguel Torres',  role:'Dev Backend',      dept:'Tecnología',  email:'miguel@empresa.com', status:'online',  avatar:null },
  { id:'u5', name:'Sofía Herrera',  role:'Marketing Lead',   dept:'Marketing',   email:'sofia@empresa.com',  status:'offline', avatar:null },
  { id:'u6', name:'Diego López',    role:'Ventas Senior',    dept:'Ventas',      email:'diego@empresa.com',  status:'online',  avatar:null },
  { id:'u7', name:'Valentina Cruz', role:'Recursos Humanos', dept:'RRHH',        email:'vale@empresa.com',   status:'away',    avatar:null },
  { id:'u8', name:'Andrés Mora',    role:'Dev Frontend',     dept:'Tecnología',  email:'andres@empresa.com', status:'offline', avatar:null },
];

const NOW = Date.now();
const SEED_POSTS = [
  {
    id:'p1', authorId:'u1', text:'¡Bienvenidos a ConnectSpace! Aquí compartiremos novedades, logros y todo lo que nos une como equipo. 🚀 Cuéntenme: ¿cuál es su meta para este trimestre?',
    image: null, likes:['u2','u3','u4','u6'], comments:[
      { id:'c1', authorId:'u2', text:'¡Excelente iniciativa! Mi meta es lanzar el nuevo microservicio de pagos.', at: new Date(NOW - 3600*1000*2) },
      { id:'c2', authorId:'u3', text:'Rediseñar el onboarding completo antes de Q3 💪', at: new Date(NOW - 3600*1000*1) },
    ], at: new Date(NOW - 3600*1000*5), pinned:true,
  },
  {
    id:'p2', authorId:'u5', text:'¡Alcanzamos el 120% de la meta de marketing este mes! 🎉 Gracias a todo el equipo por el apoyo. Adjunto el reporte ejecutivo en el canal #marketing.',
    image: null, likes:['u1','u2','u6','u7','u8'], comments:[
      { id:'c3', authorId:'u6', text:'¡Felicitaciones! El equipo de ventas también lo notó, los leads de calidad subieron mucho.', at: new Date(NOW - 1800*1000) },
    ], at: new Date(NOW - 3600*1000*10), pinned:false,
  },
  {
    id:'p3', authorId:'u4', text:'Actualización técnica: migración de base de datos completada sin downtime ✅ Documentación disponible en Confluence. Si tienen preguntas, abro un canal de Q&A esta tarde.',
    image: null, likes:['u2','u8'], comments:[], at: new Date(NOW - 3600*1000*22), pinned:false,
  },
  {
    id:'p4', authorId:'u7', text:'📢 Recordatorio: mañana es el Team Building en el Parque La Esperanza. Salida a las 9am desde la oficina principal. ¡No olviden ropa cómoda!',
    image: null, likes:['u1','u3','u5','u6'], comments:[
      { id:'c4', authorId:'u3', text:'¡Anotado! ¿Llevamos algo de comer?', at: new Date(NOW - 7200*1000) },
      { id:'c5', authorId:'u7', text:'@Laura Sí, habrá catering pero pueden traer snacks 😊', at: new Date(NOW - 3600*1000) },
    ], at: new Date(NOW - 86400*1000), pinned:false,
  },
];

const SEED_CHANNELS = [
  { id:'ch1', name:'general',    desc:'Canal principal del equipo', members:['u1','u2','u3','u4','u5','u6','u7','u8'] },
  { id:'ch2', name:'tecnología', desc:'Dev, infra y producto',       members:['u2','u4','u8'] },
  { id:'ch3', name:'marketing',  desc:'Campañas y contenido',        members:['u1','u5','u6'] },
  { id:'ch4', name:'rrhh',       desc:'Recursos humanos',            members:['u1','u7'] },
  { id:'ch5', name:'random',     desc:'Off-topic y memes 🎉',        members:['u1','u2','u3','u4','u5','u6','u7','u8'] },
];

const SEED_MESSAGES = {
  ch1: [
    { id:'m1', authorId:'u1', text:'Buenos días a todos ☀️', at: new Date(NOW - 3600*1000*3) },
    { id:'m2', authorId:'u4', text:'¡Buenos días! Ya subí el build a staging, pueden probar.', at: new Date(NOW - 3600*1000*2.5) },
    { id:'m3', authorId:'u3', text:'Perfecto, voy a revisar los flujos nuevos ahora.', at: new Date(NOW - 3600*1000*2) },
    { id:'m4', authorId:'u2', text:'@Miguel recuerda activar los feature flags en prod también.', at: new Date(NOW - 3600*1000*1.5) },
    { id:'m5', authorId:'u6', text:'¿Alguien tiene el deck de la presentación de ayer? Lo necesito para el cliente.', at: new Date(NOW - 1800*1000) },
    { id:'m6', authorId:'u5', text:'@Diego te lo mando por DM ahora.', at: new Date(NOW - 1200*1000) },
  ],
  ch2: [
    { id:'m7', authorId:'u2', text:'Daily sync en 10 minutos, sala virtual 3.', at: new Date(NOW - 7200*1000) },
    { id:'m8', authorId:'u8', text:'Voy tarde 5 min, empiecen sin mí.', at: new Date(NOW - 7100*1000) },
    { id:'m9', authorId:'u4', text:'PR #247 listo para review.', at: new Date(NOW - 3600*1000) },
  ],
  ch3: [
    { id:'m10', authorId:'u5', text:'Reporte del mes disponible en Drive.', at: new Date(NOW - 86400*1000) },
    { id:'m11', authorId:'u6', text:'Excelentes números Sofía 🔥', at: new Date(NOW - 82800*1000) },
  ],
  ch4: [
    { id:'m12', authorId:'u7', text:'Evaluaciones de desempeño abiertas hasta el viernes.', at: new Date(NOW - 172800*1000) },
  ],
  ch5: [
    { id:'m13', authorId:'u3', text:'¿Ya vieron el video del perro que hace yoga? 😂', at: new Date(NOW - 3600*2000) },
    { id:'m14', authorId:'u4', text:'Haha sí, me mandó el link Diego ayer.', at: new Date(NOW - 3600*1900) },
  ],
};

// DM seed
const SEED_DMS = {
  'u1-u2': [
    { id:'dm1', authorId:'u1', text:'Carlos, ¿puedes revisar el presupuesto Q3?', at: new Date(NOW - 7200*1000) },
    { id:'dm2', authorId:'u2', text:'Claro, lo veo esta tarde.', at: new Date(NOW - 7100*1000) },
  ],
  'u1-u3': [
    { id:'dm3', authorId:'u3', text:'Ana, te mandé los mockups nuevos.', at: new Date(NOW - 3600*1000) },
    { id:'dm4', authorId:'u1', text:'¡Gracias Laura! Se ven increíbles.', at: new Date(NOW - 3500*1000) },
  ],
};

function dmKey(a, b) { return [a,b].sort().join('-'); }

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type='success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, add };
}

function Toasts({ toasts }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type==='error' ? C.danger : t.type==='warning' ? C.warning : C.success,
          color:'#fff', padding:'11px 18px', borderRadius:R, fontSize:14, fontFamily:F.body,
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)', animation:'toastIn .3s ease',
          display:'flex', alignItems:'center', gap:8, maxWidth:300,
        }}>
          <IcCheck s={15}/> {t.msg}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = {
    'ana@empresa.com':     { password:'demo123', userId:'u1' },
    'carlos@empresa.com':  { password:'demo123', userId:'u2' },
    'laura@empresa.com':   { password:'demo123', userId:'u3' },
    'miguel@empresa.com':  { password:'demo123', userId:'u4' },
    'sofia@empresa.com':   { password:'demo123', userId:'u5' },
    'diego@empresa.com':   { password:'demo123', userId:'u6' },
    'vale@empresa.com':    { password:'demo123', userId:'u7' },
    'andres@empresa.com':  { password:'demo123', userId:'u8' },
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const acc = DEMO_ACCOUNTS[email.toLowerCase().trim()];
      if (acc && acc.password === pass) {
        onLogin(SEED_USERS.find(u => u.id === acc.userId));
      } else {
        setError('Correo o contraseña incorrectos.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, background:C.accent, borderRadius:16, marginBottom:16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 style={{ fontFamily:F.head, fontSize:28, fontWeight:800, color:C.text, letterSpacing:'-0.5px' }}>ConnectSpace</h1>
          <p style={{ color:C.textSub, fontSize:14, marginTop:6 }}>Tu red social empresarial</p>
        </div>

        {/* Card */}
        <div style={{ background:C.bgCard, borderRadius:16, padding:32, border:`1px solid ${C.border}` }}>
          <h2 style={{ fontFamily:F.head, fontSize:20, fontWeight:700, marginBottom:24 }}>Iniciar sesión</h2>
          <form onSubmit={submit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textSub, marginBottom:6 }}>Correo corporativo</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ana@empresa.com"
                style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'11px 14px', fontSize:14, color:C.text, fontFamily:F.body }}
              />
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textSub, marginBottom:6 }}>Contraseña</label>
              <input
                type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
                style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'11px 14px', fontSize:14, color:C.text, fontFamily:F.body }}
              />
            </div>
            {error && <p style={{ color:C.danger, fontSize:13, marginBottom:12 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width:'100%', background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:600,
              fontFamily:F.body, marginTop:16, opacity:loading?0.7:1, transition:'background .15s',
            }}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:24, padding:16, background:C.bgInput, borderRadius:8, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:12, fontWeight:600, color:C.textSub, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Cuentas de demo</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {SEED_USERS.slice(0,4).map(u => (
                <button key={u.id} onClick={()=>{ setEmail(u.email); setPass('demo123'); }} style={{
                  background:C.accentLight, color:C.accent, border:`1px solid ${C.accent}33`, borderRadius:6,
                  padding:'4px 10px', fontSize:12, fontFamily:F.body, fontWeight:500,
                }}>
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <p style={{ fontSize:11, color:C.textSub, marginTop:8 }}>Contraseña para todas: <strong style={{color:C.text}}>demo123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEED MODULE
// ═══════════════════════════════════════════════════════════════════════════════
// Renders text with @mentions highlighted
function RichText({ text }) {
  if (!text) return null;
  const parts = text.split(/(@\w[\w\s]*)/g);
  return (
    <p style={{ fontSize:15, lineHeight:1.65, color:'#F0F1F8', whiteSpace:'pre-wrap', margin:0 }}>
      {parts.map((part, i) =>
        part.startsWith('@')
          ? <strong key={i} style={{ color:'#6366F1', fontWeight:600 }}>{part}</strong>
          : part
      )}
    </p>
  );
}

function FeedModule({ me, toast }) {
  const [posts, setPosts]         = useState(SEED_POSTS);
  const [draft, setDraft]         = useState('');
  const [draftImage, setDraftImage] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts, setCommentDrafts]       = useState({});
  const [posting, setPosting]     = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const fileInputRef              = useRef(null);
  const textareaRef               = useRef(null);

  // @mention autocomplete
  const [mentionQuery, setMentionQuery] = useState(null); // null = closed, string = filter
  const [mentionStart, setMentionStart] = useState(0);

  const handleDraftChange = (e) => {
    const val = e.target.value;
    setDraft(val);
    const pos = e.target.selectionStart;
    // find if cursor is right after an @ and some letters
    const before = val.slice(0, pos);
    const match = before.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setMentionStart(before.lastIndexOf('@'));
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user) => {
    const before = draft.slice(0, mentionStart);
    const after  = draft.slice(textareaRef.current?.selectionStart || mentionStart);
    const newVal = `${before}@${user.name} ${after}`;
    setDraft(newVal);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const mentionSuggestions = mentionQuery !== null
    ? SEED_USERS.filter(u => u.id !== me.id && u.name.toLowerCase().includes(mentionQuery)).slice(0, 5)
    : [];

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast('La imagen no debe superar 8 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setDraftImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const submitPost = () => {
    if (!draft.trim() && !draftImage) return;
    setPosting(true);
    setTimeout(() => {
      const p = { id:`p${Date.now()}`, authorId:me.id, text:draft.trim(), image:draftImage, likes:[], comments:[], at:new Date(), pinned:false };
      setPosts(prev => [p, ...prev]);
      setDraft('');
      setDraftImage(null);
      setPosting(false);
      toast('Publicación creada');
    }, 400);
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(me.id);
      return { ...p, likes: liked ? p.likes.filter(id=>id!==me.id) : [...p.likes, me.id] };
    }));
  };

  const submitComment = (postId) => {
    const text = (commentDrafts[postId]||'').trim();
    if (!text) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, { id:`c${Date.now()}`, authorId:me.id, text, at:new Date() }] };
    }));
    setCommentDrafts(prev => ({...prev, [postId]:''}));
    toast('Comentario agregado');
  };

  const userById = (id) => SEED_USERS.find(u=>u.id===id) || { name:'Usuario', id };

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px', display:'flex', flexDirection:'column', gap:20 }}>
      {viewingUser && <UserProfileModal userId={viewingUser} me={me} onClose={()=>setViewingUser(null)} onMessage={(u)=>toast(`Abre Mensajes para chatear con ${u.name.split(' ')[0]}`)}/>}
      {/* Compose */}
      <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}`, animation:'fadeUp .3s ease' }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <Avatar name={me.name} size={40}/>
          <div style={{ flex:1, position:'relative' }}>
            <textarea
              ref={textareaRef}
              value={draft} onChange={handleDraftChange}
              placeholder={`¿Qué quieres compartir, ${me.name.split(' ')[0]}? Escribe @ para mencionar`}
              rows={3}
              style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', fontSize:14, color:C.text, fontFamily:F.body, resize:'none' }}
            />
            {mentionSuggestions.length > 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden', zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
                {mentionSuggestions.map(u => (
                  <button key={u.id} onMouseDown={e=>{ e.preventDefault(); insertMention(u); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', color:C.text, fontFamily:F.body, fontSize:14, textAlign:'left', cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <Avatar name={u.name} size={28}/>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{u.name}</div>
                      <div style={{ fontSize:11, color:C.textSub }}>{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {draftImage && (
              <div style={{ position:'relative', marginTop:10, borderRadius:10, overflow:'hidden' }}>
                <img src={draftImage} alt="preview" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block', borderRadius:10 }}/>
                <button onClick={()=>setDraftImage(null)} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', cursor:'pointer' }}>
                  <IcX s={14}/>
                </button>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={pickImage} style={{ display:'none' }}/>
                <button onClick={()=>fileInputRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, background: draftImage?C.accentLight:'transparent', border:'none', color: draftImage?C.accent:C.textSub, fontSize:13, fontFamily:F.body, padding:'6px 10px', borderRadius:6 }}>
                  <IcImg s={16}/> Foto
                </button>
              </div>
              <button onClick={submitPost} disabled={(!draft.trim()&&!draftImage)||posting} style={{
                background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'8px 20px',
                fontSize:14, fontWeight:600, fontFamily:F.body, opacity:((!draft.trim()&&!draftImage)||posting)?0.5:1,
              }}>
                {posting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post, idx) => {
        const author = userById(post.authorId);
        const liked  = post.likes.includes(me.id);
        const showComments = expandedComments[post.id];
        return (
          <div key={post.id} style={{ background:C.bgCard, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden', animation:`fadeUp .3s ease ${idx*0.04}s both` }}>
            {post.pinned && (
              <div style={{ background:C.accentLight, borderBottom:`1px solid ${C.accent}33`, padding:'6px 20px', display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.accent, fontWeight:600 }}>
                <IcPin s={13}/> Fijado por el administrador
              </div>
            )}
            <div style={{ padding:20 }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <button onClick={()=>setViewingUser(author.id)} style={{ background:'none', border:'none', padding:0, cursor:'pointer', flexShrink:0 }}>
                  <Avatar name={author.name} src={author.id===me.id?me.avatar:undefined} size={42} online={author.status}/>
                </button>
                <div style={{ minWidth:0 }}>
                  <button onClick={()=>setViewingUser(author.id)} style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:C.text, fontWeight:600, fontSize:15, fontFamily:F.body, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%', display:'block' }}>{author.name}</button>
                  <div style={{ fontSize:12, color:C.textSub }}>{author.role} · {timeAgo(post.at)}</div>
                </div>
              </div>
              {/* Text */}
              {post.text && <RichText text={post.text}/>}
              {/* Image */}
              {post.image && (
                <div style={{ marginTop: post.text ? 12 : 0, borderRadius:10, overflow:'hidden' }}>
                  <img src={post.image} alt="post" style={{ width:'100%', maxHeight:400, objectFit:'cover', display:'block' }}/>
                </div>
              )}
              {/* Stats */}
              {(post.likes.length > 0 || post.comments.length > 0) && (
                <div style={{ display:'flex', gap:16, marginTop:14, paddingBottom:12, borderBottom:`1px solid ${C.border}`, fontSize:13, color:C.textSub }}>
                  {post.likes.length>0 && <span>👍 {post.likes.length}</span>}
                  {post.comments.length>0 && (
                    <button onClick={()=>setExpandedComments(p=>({...p,[post.id]:!p[post.id]}))} style={{ background:'none', border:'none', color:C.textSub, fontSize:13, fontFamily:F.body }}>
                      {post.comments.length} comentario{post.comments.length!==1?'s':''}
                    </button>
                  )}
                </div>
              )}
              {/* Actions */}
              <div style={{ display:'flex', gap:4, marginTop:10 }}>
                {[
                  { icon:<IcThumb s={16}/>, label:`Me gusta${liked?'  ✓':''}`, action:()=>toggleLike(post.id), active:liked },
                  { icon:<IcComment s={16}/>, label:'Comentar', action:()=>setExpandedComments(p=>({...p,[post.id]:!p[post.id]})) },
                  { icon:<IcShare s={16}/>, label:'Compartir', action:()=>toast('Enlace copiado') },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action} style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    background:btn.active?C.accentLight:'transparent', color:btn.active?C.accent:C.textSub,
                    border:'none', borderRadius:8, padding:'8px 4px', fontSize:13, fontFamily:F.body, fontWeight:btn.active?600:400,
                    transition:'all .15s',
                  }}>{btn.icon}{btn.label}</button>
                ))}
              </div>

              {/* Comments section */}
              {showComments && (
                <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                  {post.comments.map(c => {
                    const ca = userById(c.authorId);
                    return (
                      <div key={c.id} style={{ display:'flex', gap:10 }}>
                        <Avatar name={ca.name} size={30}/>
                        <div style={{ background:C.bgInput, borderRadius:10, padding:'8px 12px', flex:1 }}>
                          <span style={{ fontWeight:600, fontSize:13 }}>{ca.name} </span>
                          <RichText text={c.text}/>
                          <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>{timeAgo(c.at)}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Add comment */}
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Avatar name={me.name} size={30}/>
                    <div style={{ flex:1, display:'flex', gap:8, background:C.bgInput, borderRadius:20, padding:'6px 6px 6px 14px', border:`1px solid ${C.border}` }}>
                      <input
                        value={commentDrafts[post.id]||''} onChange={e=>setCommentDrafts(p=>({...p,[post.id]:e.target.value}))}
                        onKeyDown={e=>e.key==='Enter'&&submitComment(post.id)}
                        placeholder="Escribe un comentario..." style={{ flex:1, background:'transparent', border:'none', fontSize:13, color:C.text, fontFamily:F.body }}
                      />
                      <button onClick={()=>submitComment(post.id)} style={{ background:C.accent, border:'none', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                        <IcSend s={12}/>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT MODULE
// ═══════════════════════════════════════════════════════════════════════════════
function ChatModule({ me, toast, isMobile }) {
  const [channels]          = useState(SEED_CHANNELS);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [dmMessages, setDmMessages] = useState(SEED_DMS);
  const [activeChat, setActiveChat] = useState({ type:'channel', id:'ch1' });
  const [draft, setDraft]   = useState('');
  const [sideOpen, setSideOpen] = useState(!isMobile);
  const bottomRef            = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [activeChat, messages, dmMessages]);

  const currentMessages = () => {
    if (activeChat.type === 'channel') return messages[activeChat.id] || [];
    const k = dmKey(me.id, activeChat.id);
    return dmMessages[k] || [];
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    const msg = { id:`m${Date.now()}`, authorId:me.id, text:draft.trim(), at:new Date() };
    if (activeChat.type === 'channel') {
      setMessages(p => ({ ...p, [activeChat.id]: [...(p[activeChat.id]||[]), msg] }));
    } else {
      const k = dmKey(me.id, activeChat.id);
      setDmMessages(p => ({ ...p, [k]: [...(p[k]||[]), msg] }));
    }
    setDraft('');
  };

  const chatTitle = () => {
    if (activeChat.type === 'channel') {
      const ch = channels.find(c=>c.id===activeChat.id);
      return ch ? `#${ch.name}` : '';
    }
    return SEED_USERS.find(u=>u.id===activeChat.id)?.name || '';
  };

  const chatSub = () => {
    if (activeChat.type === 'channel') {
      const ch = channels.find(c=>c.id===activeChat.id);
      return ch ? `${ch.members.length} miembros · ${ch.desc}` : '';
    }
    const u = SEED_USERS.find(u=>u.id===activeChat.id);
    return u ? `${u.role} · ${u.status === 'online' ? '● En línea' : u.status === 'away' ? '● Ausente' : '● Desconectado'}` : '';
  };

  const userById = (id) => SEED_USERS.find(u=>u.id===id) || { name:'Usuario', id };
  const msgs = currentMessages();

  // Group messages by date
  const grouped = msgs.reduce((acc, m) => {
    const d = new Date(m.at).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  const dmUsers = SEED_USERS.filter(u => u.id !== me.id).slice(0, 5);

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Channel / DM sidebar */}
      {(sideOpen || !isMobile) && (
        <div style={{
          width: isMobile ? '100%' : 240, flexShrink:0, background:C.bgSidebar, borderRight:`1px solid ${C.border}`,
          display:'flex', flexDirection:'column', overflow:'hidden',
          ...(isMobile ? { position:'absolute', zIndex:10, top:0, left:0, bottom:0, animation:'slideIn .2s ease' } : {}),
        }}>
          <div style={{ padding:'16px 16px 8px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:C.bgInput, borderRadius:8, padding:'7px 12px' }}>
              <IcSearch s={14} /><input placeholder="Buscar canal..." style={{ flex:1, background:'transparent', border:'none', fontSize:13, color:C.text, fontFamily:F.body }}/>
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
            <div style={{ padding:'10px 16px 4px', fontSize:11, fontWeight:700, color:C.textSub, textTransform:'uppercase', letterSpacing:'0.5px' }}>Canales</div>
            {channels.map(ch => {
              const active = activeChat.type==='channel' && activeChat.id===ch.id;
              return (
                <button key={ch.id} onClick={()=>{ setActiveChat({type:'channel',id:ch.id}); if(isMobile) setSideOpen(false); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 16px',
                  background: active ? C.accentLight : 'transparent', border:'none', borderLeft:`2px solid ${active?C.accent:'transparent'}`,
                  color: active ? C.accent : C.textSub, fontFamily:F.body, fontSize:14, textAlign:'left', transition:'all .15s',
                }}>
                  <IcHash s={15}/> {ch.name}
                </button>
              );
            })}

            <div style={{ padding:'14px 16px 4px', fontSize:11, fontWeight:700, color:C.textSub, textTransform:'uppercase', letterSpacing:'0.5px' }}>Mensajes directos</div>
            {dmUsers.map(u => {
              const active = activeChat.type==='dm' && activeChat.id===u.id;
              return (
                <button key={u.id} onClick={()=>{ setActiveChat({type:'dm',id:u.id}); if(isMobile) setSideOpen(false); }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 16px',
                  background: active ? C.accentLight : 'transparent', border:'none', borderLeft:`2px solid ${active?C.accent:'transparent'}`,
                  color: active ? C.text : C.textSub, fontFamily:F.body, fontSize:14, textAlign:'left', transition:'all .15s',
                }}>
                  <Avatar name={u.name} size={24} online={u.status}/>
                  <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Header */}
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, background:C.bgCard }}>
          {isMobile && (
            <button onClick={()=>setSideOpen(true)} style={{ background:'none', border:'none', color:C.textSub, padding:4 }}>☰</button>
          )}
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>{chatTitle()}</div>
            <div style={{ fontSize:12, color:C.textSub }}>{chatSub()}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:4 }}>
          {Object.entries(grouped).map(([date, dayMsgs]) => (
            <div key={date}>
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0 8px' }}>
                <div style={{ flex:1, height:1, background:C.border }}/>
                <span style={{ fontSize:12, color:C.textSub, fontWeight:500 }}>{new Date(date).toLocaleDateString('es-MX',{weekday:'long',month:'long',day:'numeric'})}</span>
                <div style={{ flex:1, height:1, background:C.border }}/>
              </div>
              {dayMsgs.map((msg, i) => {
                const author  = userById(msg.authorId);
                const isMe    = msg.authorId === me.id;
                const prevMsg = dayMsgs[i-1];
                const compact = prevMsg && prevMsg.authorId === msg.authorId && (new Date(msg.at) - new Date(prevMsg.at)) < 120000;
                return (
                  <div key={msg.id} style={{ display:'flex', gap:10, padding: compact ? '2px 0 2px 46px' : '8px 0 2px', alignItems:'flex-start' }}>
                    {!compact && <Avatar name={author.name} size={36}/>}
                    <div style={{ flex:1, minWidth:0 }}>
                      {!compact && (
                        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:2 }}>
                          <span style={{ fontWeight:600, fontSize:14, color: isMe ? C.accent : C.text }}>{author.name}</span>
                          <span style={{ fontSize:11, color:C.textSub }}>{new Date(msg.at).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                      )}
                      <p style={{ fontSize:14, lineHeight:1.5, color:C.text, wordBreak:'break-word' }}>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {msgs.length === 0 && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:C.textSub, gap:8 }}>
              <IcMsg s={40}/>
              <p>Sé el primero en escribir en este canal</p>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}`, background:C.bgCard }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end', background:C.bgInput, borderRadius:12, padding:'8px 8px 8px 16px', border:`1px solid ${C.border}` }}>
            <textarea
              value={draft} onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } }}
              placeholder={`Mensaje en ${chatTitle()}`} rows={1}
              style={{ flex:1, background:'transparent', border:'none', fontSize:14, color:C.text, fontFamily:F.body, resize:'none', lineHeight:1.5, maxHeight:120, overflowY:'auto' }}
            />
            <button onClick={sendMessage} disabled={!draft.trim()} style={{
              background: draft.trim() ? C.accent : C.border, color:'#fff', border:'none',
              borderRadius:8, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background .15s',
            }}>
              <IcSend s={15}/>
            </button>
          </div>
          <p style={{ fontSize:11, color:C.textSub, marginTop:6 }}>Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function UserProfileModal({ userId, me, onClose, onMessage }) {
  const u = SEED_USERS.find(u => u.id === userId);
  if (!u) return null;
  const statusLabel = { online:'En línea', away:'Ausente', offline:'Desconectado' };
  const statusColor = { online:C.online, away:C.warning, offline:C.offline };
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:300, animation:'fadeIn .15s ease' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(420px, 92vw)', background:C.bgCard, borderRadius:20, overflow:'hidden', zIndex:301, animation:'fadeUp .2s ease', border:`1px solid ${C.border}` }}>
        {/* Cover */}
        <div style={{ height:90, background:`linear-gradient(135deg, ${C.accent} 0%, #8B5CF6 100%)`, position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.3)', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', cursor:'pointer' }}>
            <IcX s={14}/>
          </button>
          <div style={{ position:'absolute', bottom:-28, left:20 }}>
            <Avatar name={u.name} src={u.avatar} size={60} online={u.status}/>
          </div>
        </div>
        <div style={{ padding:'36px 20px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:F.head, fontSize:18, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
              <div style={{ fontSize:13, color:C.textSub, marginTop:2 }}>{u.role} · {u.dept}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, background:`${statusColor[u.status]}22`, color:statusColor[u.status], borderRadius:20, padding:'3px 10px', flexShrink:0 }}>
              {statusLabel[u.status]}
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:C.textSub, overflow:'hidden' }}>
              <IcMail s={14}/> <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:C.textSub }}>
              <IcUsers s={14}/> {u.dept}
            </div>
          </div>
          {u.id !== me.id && (
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={()=>{ onMessage(u); onClose(); }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'10px', fontSize:14, fontWeight:600, fontFamily:F.body }}>
                <IcMsg s={15}/> Enviar mensaje
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECTORY MODULE
// ═══════════════════════════════════════════════════════════════════════════════
function DirectoryModule({ me, toast }) {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [viewingUser, setViewingUser] = useState(null);

  const depts = ['all', ...new Set(SEED_USERS.map(u=>u.dept))];
  const statusLabel = { online:'En línea', away:'Ausente', offline:'Desconectado' };
  const statusColor = { online:C.online, away:C.warning, offline:C.offline };

  const filtered = SEED_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase());
    const matchDept   = filter === 'all' || u.dept === filter;
    return matchSearch && matchDept;
  });

  return (
    <div style={{ padding:'24px 16px', maxWidth:900, margin:'0 auto' }}>
      {viewingUser && <UserProfileModal userId={viewingUser} me={me} onClose={()=>setViewingUser(null)} onMessage={(u)=>toast(`Abre Mensajes para chatear con ${u.name.split(' ')[0]}`)}/>}
      <h2 style={{ fontFamily:F.head, fontSize:22, fontWeight:700, marginBottom:20 }}>Directorio del equipo</h2>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.bgCard, borderRadius:10, padding:'8px 14px', border:`1px solid ${C.border}`, flex:1, minWidth:200 }}>
          <IcSearch s={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o cargo..." style={{ flex:1, background:'transparent', border:'none', fontSize:14, color:C.text, fontFamily:F.body }}/>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {depts.map(d => (
            <button key={d} onClick={()=>setFilter(d)} style={{
              background: filter===d ? C.accent : C.bgCard, color: filter===d ? '#fff' : C.textSub,
              border:`1px solid ${filter===d ? C.accent : C.border}`, borderRadius:8, padding:'8px 14px', fontSize:13, fontFamily:F.body, fontWeight:500,
            }}>{d==='all'?'Todos':d}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
        {filtered.map((u, i) => (
          <div key={u.id} style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}`, animation:`fadeUp .3s ease ${i*0.04}s both`, transition:'border-color .15s', cursor:'pointer' }}
            onClick={()=>setViewingUser(u.id)}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
              <Avatar name={u.name} size={52} online={u.status}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize:12, color:C.textSub, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.role}</div>
                <span style={{ display:'inline-block', marginTop:4, fontSize:11, fontWeight:600, background:`${statusColor[u.status]}22`, color:statusColor[u.status], borderRadius:20, padding:'2px 8px' }}>
                  {statusLabel[u.status]}
                </span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.textSub, overflow:'hidden' }}>
                <IcUsers s={13}/> <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.dept}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.textSub, overflow:'hidden' }}>
                <IcMail s={13}/> <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
              </div>
            </div>
            {u.id !== me.id && (
              <button onClick={()=>toast(`Mensaje a ${u.name.split(' ')[0]} (usa el Chat)`)} style={{
                marginTop:14, width:'100%', background:C.accentLight, color:C.accent, border:`1px solid ${C.accent}44`,
                borderRadius:8, padding:'8px', fontSize:13, fontWeight:600, fontFamily:F.body,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                <IcMsg s={14}/> Enviar mensaje
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS MODULE
// ═══════════════════════════════════════════════════════════════════════════════
function AnnouncementsModule({ me, toast }) {
  const isAdmin = me.id === 'u1' || me.id === 'u7';
  const [announcements, setAnnouncements] = useState([
    {
      id:'a1', title:'Nuevas políticas de trabajo híbrido', body:'A partir del 1 de julio, el equipo puede trabajar hasta 3 días desde casa. Las áreas de Tecnología y Diseño tienen mayor flexibilidad. Consulten el documento adjunto para los detalles completos.',
      authorId:'u7', at: new Date(NOW - 86400*1000*2), priority:'alta', category:'RRHH',
    },
    {
      id:'a2', title:'Resultado Q2 — Superamos la meta 🎉', body:'¡Excelentes noticias! Cerramos Q2 con un crecimiento del 34% en ingresos vs el año anterior. Este logro es de todos. El viernes habrá celebración en la sala principal a las 17:00.',
      authorId:'u1', at: new Date(NOW - 86400*1000*5), priority:'normal', category:'Empresa',
    },
    {
      id:'a3', title:'Mantenimiento de servidores — Domingo 2am', body:'El equipo de infraestructura realizará mantenimiento programado el domingo de 2am a 4am. Los servicios pueden tener interrupciones breves. Se notificará cuando concluya.',
      authorId:'u2', at: new Date(NOW - 86400*1000*7), priority:'urgente', category:'Tecnología',
    },
    {
      id:'a4', title:'Programa de referidos activo', body:'Si recomiendas a alguien que sea contratado, recibes un bono de $5,000 MXN. El programa está activo hasta septiembre. Habla con RRHH para más detalles.',
      authorId:'u7', at: new Date(NOW - 86400*1000*10), priority:'normal', category:'RRHH',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', body:'', priority:'normal', category:'Empresa' });

  const priorityColors = { urgente:C.danger, alta:C.warning, normal:C.accent };
  const priorityBg     = { urgente:'#EF444422', alta:'#F59E0B22', normal:C.accentLight };

  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) { toast('Completa todos los campos','error'); return; }
    setAnnouncements(p => [{ id:`a${Date.now()}`, ...form, authorId:me.id, at:new Date() }, ...p]);
    setForm({ title:'', body:'', priority:'normal', category:'Empresa' });
    setShowForm(false);
    toast('Anuncio publicado');
  };

  const userById = (id) => SEED_USERS.find(u=>u.id===id) || { name:'Usuario' };

  return (
    <div style={{ padding:'24px 16px', maxWidth:760, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h2 style={{ fontFamily:F.head, fontSize:22, fontWeight:700 }}>Anuncios</h2>
        {isAdmin && (
          <button onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:14, fontWeight:600, fontFamily:F.body }}>
            <IcPlus s={15}/> Nuevo anuncio
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:C.bgCard, borderRadius:16, padding:24, border:`1px solid ${C.border}`, marginBottom:20, animation:'fadeUp .25s ease' }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, marginBottom:16 }}>Nuevo anuncio</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Título del anuncio"
              style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, fontFamily:F.body }}/>
            <textarea value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} placeholder="Contenido del anuncio..." rows={4}
              style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, fontFamily:F.body, resize:'none' }}/>
            <div style={{ display:'flex', gap:12 }}>
              {[['priority','Prioridad',['normal','alta','urgente']],['category','Categoría',['Empresa','Tecnología','RRHH','Marketing']]].map(([k,label,opts]) => (
                <div key={k} style={{ flex:1 }}>
                  <label style={{ display:'block', fontSize:12, color:C.textSub, marginBottom:4 }}>{label}</label>
                  <select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body }}>
                    {opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, borderRadius:8, padding:'9px 16px', fontSize:14, fontFamily:F.body }}>Cancelar</button>
              <button onClick={submit} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:14, fontWeight:600, fontFamily:F.body }}>Publicar</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {announcements.map((a, i) => {
          const author = userById(a.authorId);
          return (
            <div key={a.id} style={{ background:C.bgCard, borderRadius:16, padding:24, border:`1px solid ${C.border}`, animation:`fadeUp .3s ease ${i*0.05}s both` }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:10 }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, fontWeight:700, background:priorityBg[a.priority], color:priorityColors[a.priority], borderRadius:20, padding:'3px 10px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{a.priority}</span>
                  <span style={{ fontSize:11, fontWeight:600, background:C.bgInput, color:C.textSub, borderRadius:20, padding:'3px 10px' }}>{a.category}</span>
                </div>
                <span style={{ fontSize:12, color:C.textSub }}>{timeAgo(a.at)}</span>
              </div>
              <h3 style={{ fontFamily:F.head, fontSize:17, fontWeight:700, marginBottom:8 }}>{a.title}</h3>
              <p style={{ fontSize:14, color:C.textSub, lineHeight:1.7 }}>{a.body}</p>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <Avatar name={author.name} size={24}/>
                <span style={{ fontSize:13, color:C.textSub }}>{author.name} · {author.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE MODULE
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileModule({ me, toast, onAvatarChange }) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name:me.name, role:me.role, dept:me.dept, email:me.email });
  const avatarInputRef          = useRef(null);

  const save = () => { setEditing(false); toast('Perfil actualizado'); };

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('La imagen no debe superar 5 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { onAvatarChange(ev.target.result); toast('Foto de perfil actualizada ✓'); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div style={{ padding:'24px 16px', maxWidth:600, margin:'0 auto' }}>
      <div style={{ background:C.bgCard, borderRadius:20, overflow:'hidden', border:`1px solid ${C.border}` }}>
        {/* Cover */}
        <div style={{ height:120, background:`linear-gradient(135deg, ${C.accent} 0%, #8B5CF6 100%)`, position:'relative' }}>
          <div style={{ position:'absolute', bottom:-36, left:24 }}>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={pickAvatar} style={{ display:'none' }}/>
            <div style={{ position:'relative', cursor:'pointer' }} onClick={()=>avatarInputRef.current?.click()}>
              <Avatar name={me.name} src={me.avatar} size={76}/>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.45)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0)'}
              >
                <span style={{ color:'#fff', fontSize:11, fontWeight:700, pointerEvents:'none', opacity:0, transition:'opacity .2s' }}
                  ref={el=>{ if(el) { el.closest('div').addEventListener('mouseenter',()=>el.style.opacity=1); el.closest('div').addEventListener('mouseleave',()=>el.style.opacity=0); } }}>
                  📷 Cambiar
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding:'44px 24px 24px' }}>
          {!editing ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily:F.head, fontSize:22, fontWeight:800 }}>{me.name}</h2>
                  <p style={{ fontSize:14, color:C.textSub, marginTop:2 }}>{me.role} · {me.dept}</p>
                </div>
                <button onClick={()=>setEditing(true)} style={{ background:C.accentLight, color:C.accent, border:`1px solid ${C.accent}44`, borderRadius:8, padding:'7px 14px', fontSize:13, fontWeight:600, fontFamily:F.body }}>
                  Editar
                </button>
              </div>
              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10 }}>
                {[['Correo', me.email, <IcMail s={15}/>],[`Departamento`, me.dept, <IcUsers s={15}/>]].map(([label,val,icon]) => (
                  <div key={label} style={{ display:'flex', gap:10, alignItems:'center', fontSize:14 }}>
                    <span style={{ color:C.textSub }}>{icon}</span>
                    <span style={{ color:C.textSub, minWidth:110 }}>{label}:</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:24 }}>
                {[['Posts','4'],['Comentarios','7'],['Likes recibidos','12']].map(([label,val]) => (
                  <div key={label} style={{ background:C.bgInput, borderRadius:12, padding:'14px', textAlign:'center', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:22, fontWeight:800, fontFamily:F.head, color:C.accent }}>{val}</div>
                    <div style={{ fontSize:12, color:C.textSub, marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <h2 style={{ fontFamily:F.head, fontSize:18, fontWeight:700 }}>Editar perfil</h2>
              {[['Nombre completo','name','text'],['Cargo / Rol','role','text'],['Departamento','dept','text']].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:12, color:C.textSub, marginBottom:4 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                    style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, fontFamily:F.body }}/>
                </div>
              ))}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                <button onClick={()=>setEditing(false)} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, borderRadius:8, padding:'9px 16px', fontSize:14, fontFamily:F.body }}>Cancelar</button>
                <button onClick={save} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:14, fontWeight:600, fontFamily:F.body }}>Guardar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsPanel({ onClose }) {
  const notifications = [
    { id:'n1', type:'like',    actor:'Carlos Ruiz',    text:'le dio Me gusta a tu publicación', at: new Date(NOW - 1800*1000), read:false },
    { id:'n2', type:'comment', actor:'Laura Sánchez',  text:'comentó en tu publicación', at: new Date(NOW - 3600*1000), read:false },
    { id:'n3', type:'mention', actor:'Sofía Herrera',  text:'te mencionó en #marketing', at: new Date(NOW - 7200*1000), read:false },
    { id:'n4', type:'message', actor:'Diego López',    text:'te envió un mensaje directo', at: new Date(NOW - 86400*1000), read:true },
    { id:'n5', type:'like',    actor:'Miguel Torres',  text:'le dio Me gusta a tu comentario', at: new Date(NOW - 86400*1000*2), read:true },
  ];

  const typeIcon = { like:<IcThumb s={14}/>, comment:<IcComment s={14}/>, mention:'@', message:<IcMsg s={14}/> };
  const typeBg   = { like:'#6366F122', comment:'#22C55E22', mention:'#F59E0B22', message:'#EC489922' };
  const typeColor= { like:C.accent, comment:C.success, mention:C.warning, message:'#EC4899' };

  return (
    <div style={{ position:'fixed', top:56, right:16, width:340, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.5)', zIndex:200, animation:'fadeUp .2s ease', overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700 }}>Notificaciones</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', color:C.textSub, padding:4 }}><IcX s={16}/></button>
      </div>
      <div style={{ maxHeight:400, overflowY:'auto' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ display:'flex', gap:12, padding:'14px 20px', borderBottom:`1px solid ${C.border}`, background: n.read ? 'transparent' : C.accentLight, cursor:'pointer' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:typeBg[n.type], display:'flex', alignItems:'center', justifyContent:'center', color:typeColor[n.type], flexShrink:0 }}>
              {typeIcon[n.type]}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, lineHeight:1.5 }}><strong>{n.actor}</strong> {n.text}</p>
              <p style={{ fontSize:11, color:C.textSub, marginTop:2 }}>{timeAgo(n.at)}</p>
            </div>
            {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:C.accent, flexShrink:0, marginTop:4 }}/>}
          </div>
        ))}
      </div>
      <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}` }}>
        <button style={{ width:'100%', background:C.accentLight, color:C.accent, border:'none', borderRadius:8, padding:'8px', fontSize:13, fontWeight:600, fontFamily:F.body }}>
          Ver todas
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KUDOS MODULE
// ═══════════════════════════════════════════════════════════════════════════════
const KUDOS_CATEGORIES = [
  { id:'trabajo', label:'Gran trabajo', emoji:'🏆' },
  { id:'ayuda',   label:'Siempre ayuda',emoji:'🤝' },
  { id:'innova',  label:'Innovación',   emoji:'💡' },
  { id:'lider',   label:'Liderazgo',    emoji:'🌟' },
  { id:'cliente', label:'Enfoque cliente',emoji:'❤️' },
  { id:'equipo',  label:'Trabajo en equipo',emoji:'🔥' },
];

function KudosModule({ me, toast }) {
  const [kudos, setKudos] = useState([
    { id:'k1', fromId:'u1', toId:'u4', category:'innova', message:'Miguel, tu solución para la migración sin downtime fue brillante. El equipo entero lo agradeció.', at: new Date(NOW - 86400*1000*2), likes:['u2','u3'] },
    { id:'k2', fromId:'u2', toId:'u3', category:'trabajo', message:'Laura, los nuevos diseños elevaron completamente la experiencia. Los usuarios aman el nuevo onboarding.', at: new Date(NOW - 86400*1000*4), likes:['u1','u5','u6'] },
    { id:'k3', fromId:'u7', toId:'u6', category:'cliente', message:'Diego, cerraste el deal más difícil del trimestre con una paciencia y profesionalismo increíbles. 🎉', at: new Date(NOW - 86400*1000*6), likes:['u1','u2'] },
    { id:'k4', fromId:'u5', toId:'u8', category:'ayuda', message:'Andrés siempre tiene tiempo para ayudar a cualquiera del equipo, sin importar su carga de trabajo.', at: new Date(NOW - 86400*1000*9), likes:['u3','u7'] },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ toId:'', category:'trabajo', message:'' });

  const userById = id => SEED_USERS.find(u => u.id === id) || { name:'Usuario' };
  const otherUsers = SEED_USERS.filter(u => u.id !== me.id);

  const submit = () => {
    if (!form.toId || !form.message.trim()) { toast('Completa todos los campos','error'); return; }
    setKudos(p => [{ id:`k${Date.now()}`, fromId:me.id, ...form, at:new Date(), likes:[] }, ...p]);
    setForm({ toId:'', category:'trabajo', message:'' });
    setShowForm(false);
    toast(`Reconocimiento enviado a ${userById(form.toId).name.split(' ')[0]} 🎉`);
  };

  const toggleLike = id => setKudos(p => p.map(k => k.id !== id ? k : {
    ...k, likes: k.likes.includes(me.id) ? k.likes.filter(x=>x!==me.id) : [...k.likes, me.id]
  }));

  return (
    <div style={{ padding:'24px 16px', maxWidth:700, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:F.head, fontSize:22, fontWeight:700 }}>Reconocimientos</h2>
          <p style={{ fontSize:13, color:C.textSub, marginTop:2 }}>Celebra los logros de tu equipo públicamente</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:6, background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:14, fontWeight:600, fontFamily:F.body }}>
          <IcPlus s={15}/> Dar kudos
        </button>
      </div>

      {showForm && (
        <div style={{ background:C.bgCard, borderRadius:16, padding:24, border:`1px solid ${C.border}`, marginBottom:20, animation:'fadeUp .25s ease' }}>
          <h3 style={{ fontFamily:F.head, fontSize:16, fontWeight:700, marginBottom:16 }}>Dar reconocimiento</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, color:C.textSub, marginBottom:4 }}>¿A quién?</label>
              <select value={form.toId} onChange={e=>setForm(p=>({...p,toId:e.target.value}))} style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 12px', fontSize:14, color:C.text, fontFamily:F.body }}>
                <option value="">Selecciona una persona...</option>
                {otherUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:C.textSub, marginBottom:8 }}>Categoría</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {KUDOS_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={()=>setForm(p=>({...p,category:cat.id}))} style={{
                    padding:'6px 12px', borderRadius:20, fontSize:13, fontFamily:F.body, fontWeight:500, cursor:'pointer',
                    background: form.category===cat.id ? C.accent : C.bgInput,
                    color: form.category===cat.id ? '#fff' : C.textSub,
                    border:`1px solid ${form.category===cat.id ? C.accent : C.border}`,
                  }}>{cat.emoji} {cat.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:C.textSub, marginBottom:4 }}>Mensaje</label>
              <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="¿Qué hizo esta persona que merece reconocimiento?" rows={3}
                style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px', fontSize:14, color:C.text, fontFamily:F.body, resize:'none' }}/>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, borderRadius:8, padding:'9px 16px', fontSize:14, fontFamily:F.body }}>Cancelar</button>
              <button onClick={submit} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontSize:14, fontWeight:600, fontFamily:F.body }}>Publicar reconocimiento</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {kudos.map((k, i) => {
          const from = userById(k.fromId);
          const to   = userById(k.toId);
          const cat  = KUDOS_CATEGORIES.find(c=>c.id===k.category) || KUDOS_CATEGORIES[0];
          const liked = k.likes.includes(me.id);
          return (
            <div key={k.id} style={{ background:C.bgCard, borderRadius:16, padding:24, border:`1px solid ${C.border}`, animation:`fadeUp .3s ease ${i*0.05}s both` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ fontSize:32 }}>{cat.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14 }}>
                    <strong>{from.name}</strong> <span style={{color:C.textSub}}>reconoció a</span> <strong style={{color:C.accent}}>{to.name}</strong>
                  </div>
                  <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>{cat.label} · {timeAgo(k.at)}</div>
                </div>
                <Avatar name={to.name} size={44}/>
              </div>
              <p style={{ fontSize:14, lineHeight:1.7, color:C.textSub, fontStyle:'italic', borderLeft:`3px solid ${C.accent}`, paddingLeft:12 }}>"{k.message}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14 }}>
                <button onClick={()=>toggleLike(k.id)} style={{ display:'flex', alignItems:'center', gap:6, background: liked?C.accentLight:'transparent', border:`1px solid ${liked?C.accent:C.border}`, color: liked?C.accent:C.textSub, borderRadius:20, padding:'5px 12px', fontSize:13, fontFamily:F.body, fontWeight: liked?600:400 }}>
                  👏 {k.likes.length > 0 ? k.likes.length : ''} Aplaudir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDARIO MODULE
// ═══════════════════════════════════════════════════════════════════════════════
function CalendarModule({ me, toast }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([
    { id:'ev1', title:'Daily Standup', date:'2026-06-24', time:'09:00', endTime:'09:15', type:'reunion', attendees:['u2','u4','u8'], organizer:'u2', desc:'Sync diario del equipo de tecnología' },
    { id:'ev2', title:'Team Building — Parque La Esperanza', date:'2026-06-25', time:'09:00', endTime:'14:00', type:'social', attendees:['u1','u2','u3','u4','u5','u6','u7','u8'], organizer:'u7', desc:'Actividad de integración del equipo completo' },
    { id:'ev3', title:'Presentación Q2 a Inversores', date:'2026-06-27', time:'11:00', endTime:'12:30', type:'importante', attendees:['u1','u2','u5','u6'], organizer:'u1', desc:'Presentación de resultados y roadmap Q3' },
    { id:'ev4', title:'1:1 CEO — Carlos', date:'2026-06-30', time:'16:00', endTime:'16:30', type:'reunion', attendees:['u1','u2'], organizer:'u1', desc:'Revisión mensual de OKRs tecnología' },
    { id:'ev5', title:'Evaluaciones de desempeño', date:'2026-07-04', time:'10:00', endTime:'18:00', type:'rrhh', attendees:['u1','u7'], organizer:'u7', desc:'Sesiones de evaluación individual por departamento' },
    { id:'ev6', title:'Lanzamiento v2.0', date:'2026-07-10', time:'09:00', endTime:'10:00', type:'importante', attendees:['u2','u3','u4','u8'], organizer:'u2', desc:'Go-live del rediseño de producto' },
    { id:'ev7', title:'Retiro de liderazgo', date:'2026-07-15', time:'08:00', endTime:'18:00', type:'social', attendees:['u1','u2','u5','u6','u7'], organizer:'u1', desc:'Planeación estratégica semestral' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ title:'', date:'', time:'09:00', endTime:'10:00', type:'reunion', desc:'' });

  const typeColors = { reunion:C.accent, importante:C.danger, social:C.success, rrhh:C.warning };
  const typeLabels = { reunion:'Reunión', importante:'Importante', social:'Social', rrhh:'RRHH' };

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const eventsForDate = (d) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return events.filter(e => e.date === ds);
  };

  const userById = id => SEED_USERS.find(u => u.id === id) || { name:'Usuario' };

  const submit = () => {
    if (!form.title.trim() || !form.date) { toast('Completa título y fecha','error'); return; }
    setEvents(p => [...p, { id:`ev${Date.now()}`, ...form, attendees:[me.id], organizer:me.id }]);
    setShowForm(false);
    setForm({ title:'', date:'', time:'09:00', endTime:'10:00', type:'reunion', desc:'' });
    toast('Evento creado');
  };

  const selectedEvents = selectedDay ? eventsForDate(selectedDay) : [];
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <div style={{ padding:'24px 16px', maxWidth:900, margin:'0 auto', display:'flex', gap:20, flexWrap:'wrap' }}>
      {/* Calendar grid */}
      <div style={{ flex:'1 1 500px' }}>
        <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <button onClick={()=>setViewDate(new Date(year, month-1, 1))} style={{ background:C.bgInput, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>‹</button>
            <h2 style={{ fontFamily:F.head, fontSize:18, fontWeight:700 }}>{monthNames[month]} {year}</h2>
            <button onClick={()=>setViewDate(new Date(year, month+1, 1))} style={{ background:C.bgInput, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:8 }}>
            {dayNames.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:C.textSub, padding:'4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {Array.from({length: firstDay === 0 ? 6 : firstDay - 1}).map((_,i) => <div key={`e${i}`}/>)}
            {Array.from({length: daysInMonth}).map((_,i) => {
              const d = i + 1;
              const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const dayEvs = eventsForDate(d);
              const isToday = ds === todayStr;
              const isSelected = selectedDay === d;
              return (
                <button key={d} onClick={()=>setSelectedDay(isSelected ? null : d)} style={{
                  background: isSelected ? C.accent : isToday ? C.accentLight : 'transparent',
                  border:`1px solid ${isSelected ? C.accent : isToday ? C.accent : C.border}`,
                  borderRadius:8, padding:'6px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, minHeight:44,
                }}>
                  <span style={{ fontSize:13, fontWeight: isToday||isSelected ? 700 : 400, color: isSelected?'#fff':isToday?C.accent:C.text }}>{d}</span>
                  <div style={{ display:'flex', gap:2, flexWrap:'wrap', justifyContent:'center' }}>
                    {dayEvs.slice(0,3).map(ev => (
                      <div key={ev.id} style={{ width:6, height:6, borderRadius:'50%', background: isSelected?'rgba(255,255,255,0.7)':typeColors[ev.type]||C.accent }}/>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={()=>{ setShowForm(!showForm); setForm(p=>({...p, date: selectedDay ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : ''})); }} style={{ marginTop:16, width:'100%', background:C.accentLight, color:C.accent, border:`1px solid ${C.accent}44`, borderRadius:8, padding:'9px', fontSize:14, fontWeight:600, fontFamily:F.body }}>
            + Nuevo evento
          </button>
        </div>

        {showForm && (
          <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}`, marginTop:16, animation:'fadeUp .2s ease' }}>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, marginBottom:14 }}>Nuevo evento</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Título del evento"
                style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body }}/>
              <div style={{ display:'flex', gap:10 }}>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                  style={{ flex:1, background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body }}/>
                <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}
                  style={{ width:100, background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body }}/>
              </div>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body }}>
                {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="Descripción (opcional)" rows={2}
                style={{ background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:C.text, fontFamily:F.body, resize:'none' }}/>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, borderRadius:8, padding:'8px 14px', fontSize:13, fontFamily:F.body }}>Cancelar</button>
                <button onClick={submit} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:600, fontFamily:F.body }}>Crear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event detail / upcoming */}
      <div style={{ flex:'1 1 280px', display:'flex', flexDirection:'column', gap:16 }}>
        {selectedDay && selectedEvents.length > 0 ? (
          <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
            <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, marginBottom:14 }}>
              {selectedDay} de {monthNames[month]}
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {selectedEvents.map(ev => (
                <div key={ev.id} style={{ borderLeft:`3px solid ${typeColors[ev.type]||C.accent}`, paddingLeft:12 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{ev.title}</div>
                  <div style={{ fontSize:12, color:C.textSub, marginTop:2 }}>{ev.time} – {ev.endTime} · {typeLabels[ev.type]}</div>
                  {ev.desc && <p style={{ fontSize:12, color:C.textSub, marginTop:4, lineHeight:1.5 }}>{ev.desc}</p>}
                  <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                    {ev.attendees.slice(0,5).map(uid => <Avatar key={uid} name={userById(uid).name} size={20}/>)}
                    {ev.attendees.length > 5 && <span style={{ fontSize:11, color:C.textSub }}>+{ev.attendees.length-5}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedDay ? (
          <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}`, textAlign:'center', color:C.textSub }}>
            <p style={{ fontSize:14 }}>Sin eventos este día</p>
          </div>
        ) : null}

        <div style={{ background:C.bgCard, borderRadius:16, padding:20, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:F.head, fontSize:15, fontWeight:700, marginBottom:14 }}>Próximos eventos</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {events.filter(e => e.date >= todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5).map(ev => (
              <div key={ev.id} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:typeColors[ev.type]+'22', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:typeColors[ev.type] }}>{ev.date.split('-')[2]}</span>
                  <span style={{ fontSize:9, color:typeColors[ev.type] }}>{monthNames[parseInt(ev.date.split('-')[1])-1].slice(0,3)}</span>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:C.textSub }}>{ev.time} · {ev.attendees.length} asistentes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WORKSPACE APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function ConnectSpace() {
  useEffect(() => { injectGlobal(); }, []);

  const [user, setUser]           = useState(null);
  const [section, setSection]     = useState('feed');
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const { toasts, add: toast }    = useToasts();

  const updateAvatar = (dataUrl) => setUser(p => ({ ...p, avatar: dataUrl }));

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  if (!user) return <AuthScreen onLogin={setUser} />;

  const NAV = [
    { id:'feed',          label:'Inicio',          icon:<IcHome s={20}/> },
    { id:'chat',          label:'Mensajes',         icon:<IcMsg s={20}/> },
    { id:'directory',     label:'Directorio',       icon:<IcUsers s={20}/> },
    { id:'kudos',         label:'Reconocimientos',  icon:<IcStar s={20}/> },
    { id:'calendar',      label:'Calendario',       icon:<IcCalendar s={20}/> },
    { id:'announcements', label:'Anuncios',          icon:<IcPin s={20}/> },
    { id:'profile',       label:'Mi Perfil',         icon:<Avatar name={user.name} size={22}/> },
  ];

  const renderSection = () => {
    const props = { me:user, toast, isMobile, onAvatarChange: updateAvatar };
    switch(section) {
      case 'feed':          return <FeedModule {...props}/>;
      case 'chat':          return <ChatModule {...props}/>;
      case 'directory':     return <DirectoryModule {...props}/>;
      case 'kudos':         return <KudosModule {...props}/>;
      case 'calendar':      return <CalendarModule {...props}/>;
      case 'announcements': return <AnnouncementsModule {...props}/>;
      case 'profile':       return <ProfileModule {...props}/>;
      default:              return <FeedModule {...props}/>;
    }
  };

  const sidebarW = 220;

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, overflow:'hidden', fontFamily:F.body }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{ width:sidebarW, flexShrink:0, background:C.bgSidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column' }}>
          {/* Logo */}
          <div style={{ padding:'16px 14px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, overflow:'hidden' }}>
              <div style={{ width:30, height:30, background:C.accent, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <IcUsers s={15}/>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:F.head, fontSize:14, fontWeight:800, letterSpacing:'-0.2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>ConnectSpace</div>
                <div style={{ fontSize:10, color:C.textSub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'8px 0' }}>
            {NAV.map(item => {
              const active = section === item.id;
              return (
                <button key={item.id} onClick={()=>setSection(item.id)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
                  background: active ? C.accentLight : 'transparent',
                  border: `none`,
                  borderLeft: `3px solid ${active ? C.accent : 'transparent'}`,
                  color: active ? C.accent : C.textSub, fontFamily:F.body, fontSize:14, fontWeight: active ? 600 : 400,
                  cursor:'pointer', transition:'all .15s', textAlign:'left',
                }}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, overflow:'hidden' }}>
              <Avatar name={user.name} src={user.avatar} size={32} online={user.status}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
                <div style={{ fontSize:11, color:C.textSub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.role}</div>
              </div>
            </div>
            <button onClick={()=>setUser(null)} style={{ width:'100%', display:'flex', alignItems:'center', gap:6, background:'transparent', border:`1px solid ${C.border}`, borderRadius:7, padding:'7px 10px', fontSize:12, color:C.textSub, fontFamily:F.body, cursor:'pointer' }}>
              <IcLogout s={14}/> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Top bar */}
        <div style={{ height:56, flexShrink:0, background:C.bgCard, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:12, zIndex:100 }}>
          {isMobile && (
            <button onClick={()=>setMobileNav(!mobileNav)} style={{ background:'none', border:'none', color:C.text, padding:4 }}>☰</button>
          )}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:C.bgInput, borderRadius:8, padding:'6px 12px', maxWidth:400 }}>
            <IcSearch s={15}/><input placeholder="Buscar en ConnectSpace..." style={{ flex:1, background:'transparent', border:'none', fontSize:13, color:C.text, fontFamily:F.body }}/>
          </div>
          <div style={{ flex:1 }}/>
          <button onClick={()=>setShowNotifs(p=>!p)} style={{ position:'relative', background: showNotifs ? C.accentLight : 'transparent', border:'none', color: showNotifs ? C.accent : C.textSub, borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IcBell s={20}/>
            <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:C.danger }}/>
          </button>
          {!isMobile && <Avatar name={user.name} size={34} online={user.status}/>}
        </div>

        {/* Section content */}
        <div style={{ flex:1, overflowY: section === 'chat' ? 'hidden' : 'auto' }}>
          {renderSection()}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.bgCard, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:100 }}>
          {NAV.slice(0,4).map(item => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={()=>setSection(item.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px 14px', background:'none', border:'none', color: active ? C.accent : C.textSub, fontSize:10, fontFamily:F.body, cursor:'pointer' }}>
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile drawer */}
      {isMobile && mobileNav && (
        <>
          <div onClick={()=>setMobileNav(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:150 }}/>
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:260, background:C.bgSidebar, zIndex:151, display:'flex', flexDirection:'column', animation:'slideIn .2s ease', borderRight:`1px solid ${C.border}` }}>
            <div style={{ padding:'16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:F.head, fontSize:16, fontWeight:800 }}>ConnectSpace</span>
              <button onClick={()=>setMobileNav(false)} style={{ background:'none', border:'none', color:C.textSub }}><IcX s={18}/></button>
            </div>
            <nav style={{ flex:1, padding:'8px 0' }}>
              {NAV.map(item => {
                const active = section === item.id;
                return (
                  <button key={item.id} onClick={()=>{ setSection(item.id); setMobileNav(false); }} style={{
                    width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 20px',
                    background: active ? C.accentLight : 'transparent', border:'none', borderLeft:`3px solid ${active?C.accent:'transparent'}`,
                    color: active ? C.accent : C.textSub, fontFamily:F.body, fontSize:15, fontWeight: active?600:400, cursor:'pointer',
                  }}>
                    {item.icon} {item.label}
                  </button>
                );
              })}
            </nav>
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${C.border}` }}>
              <button onClick={()=>setUser(null)} style={{ width:'100%', display:'flex', alignItems:'center', gap:6, background:'transparent', border:`1px solid ${C.border}`, borderRadius:7, padding:'9px', fontSize:13, color:C.textSub, fontFamily:F.body, cursor:'pointer', justifyContent:'center' }}>
                <IcLogout s={14}/> Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications panel */}
      {showNotifs && <NotificationsPanel onClose={()=>setShowNotifs(false)}/>}

      <Toasts toasts={toasts}/>
    </div>
  );
}
