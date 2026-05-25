import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LayoutDashboard, Users, UtensilsCrossed, ShoppingCart, BarChart2, Cpu, Package, MessageCircle, Star, Bot, Palette, ChevronLeft, ChevronRight, Menu, X, Bell, MoreVertical, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Send, Plus, Edit2, Trash2, Eye, Download, Copy, Mail, QrCode, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

// ─── Keyframes ───────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes drawerIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes toastIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
`;

// ─── Themes ──────────────────────────────────────────────────────────────────
const THEMES = {
  esca: {
    key: 'esca', name: 'ESCA Mediterráneo', mode: 'light',
    font: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'DM Sans', sans-serif",
    borderRadius: '12px',
    palette: {
      bg: '#F5F0E8', bgCard: '#FFFFFF', bgSidebar: '#2B5F4A', bgSidebarHover: '#1e4535',
      text: '#1C1C1C', textSecondary: '#6B6B6B', textSidebar: '#FFFFFF',
      accent: '#2B5F4A', accentLight: '#E8F0EC', accentHover: '#1e4535',
      border: '#E0D8CC', success: '#2B5F4A', warning: '#D4891A', danger: '#C0392B', info: '#2980B9',
      chartPrimary: '#2B5F4A', chartSecondary: '#8FB5A3', chartTertiary: '#D4891A',
    }
  },
  noir: {
    key: 'noir', name: 'Noir Bistró', mode: 'dark',
    font: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', sans-serif",
    borderRadius: '4px',
    palette: {
      bg: '#0D0D0D', bgCard: '#1A1A1A', bgSidebar: '#111111', bgSidebarHover: '#222222',
      text: '#F0F0F0', textSecondary: '#888888', textSidebar: '#F0F0F0',
      accent: '#C9A84C', accentLight: '#2A2418', accentHover: '#B8953D',
      border: '#2A2A2A', success: '#4CAF50', warning: '#FF9800', danger: '#F44336', info: '#2196F3',
      chartPrimary: '#C9A84C', chartSecondary: '#5A4A20', chartTertiary: '#888888',
    }
  },
  palapa: {
    key: 'palapa', name: 'La Palapa', mode: 'dark',
    font: "'Abril Fatface', cursive",
    fontBody: "'Nunito', sans-serif",
    borderRadius: '20px',
    palette: {
      bg: '#0A1A0A', bgCard: '#122212', bgSidebar: '#0D1F0D', bgSidebarHover: '#1A3A1A',
      text: '#E8F5E9', textSecondary: '#81C784', textSidebar: '#E8F5E9',
      accent: '#4CAF50', accentLight: '#1B2E1B', accentHover: '#388E3C',
      border: '#1E3A1E', success: '#66BB6A', warning: '#FFA726', danger: '#EF5350', info: '#42A5F5',
      chartPrimary: '#4CAF50', chartSecondary: '#2E7D32', chartTertiary: '#FFA726',
    }
  }
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function injectStyles() {
  if (!document.getElementById('ros-styles')) {
    const s = document.createElement('style');
    s.id = 'ros-styles';
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, addToast: add };
}

function ToastContainer({ toasts, theme }) {
  const T = theme.palette;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? T.success : t.type === 'error' ? T.danger : t.type === 'warning' ? T.warning : T.info,
          color: '#fff', padding: '12px 20px', borderRadius: theme.borderRadius, fontSize: 14,
          fontFamily: theme.fontBody, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          animation: 'toastIn 0.3s ease', display: 'flex', alignItems: 'center', gap: 8, maxWidth: 320,
        }}>
          {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children, theme, isMobile, wide }) {
  if (!open) return null;
  const T = theme.palette; const R = theme.borderRadius;
  const innerStyle = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, background: T.bgCard,
    borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', animation: 'slideUp 0.3s ease',
    maxHeight: '90vh', overflowY: 'auto', zIndex: 1001,
  } : {
    background: T.bgCard, borderRadius: R, padding: 28,
    width: wide ? '90vw' : '90vw', maxWidth: wide ? 800 : 540,
    maxHeight: '85vh', overflowY: 'auto', animation: 'fadeInUp 0.25s ease',
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={innerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: T.text, fontFamily: theme.font, fontSize: 20, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textSecondary, cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({ children, theme, style: s = {}, onClick }) {
  const T = theme.palette; const R = theme.borderRadius;
  return (
    <div onClick={onClick} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: R, padding: 20, ...s }}>
      {children}
    </div>
  );
}

function Badge({ label, color, bg }) {
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>;
}

function Btn({ children, onClick, variant = 'primary', theme, small, style: s = {}, disabled }) {
  const T = theme.palette; const R = theme.borderRadius;
  const radius = small ? '6px' : R;
  const base = { border: 'none', borderRadius: radius, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: theme.fontBody, fontWeight: 600, transition: 'all 0.15s', padding: small ? '6px 14px' : '10px 20px', fontSize: small ? 13 : 14, opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, ...s };
  const variants = {
    primary: { background: T.accent, color: '#fff' },
    secondary: { background: T.accentLight, color: T.accent },
    ghost: { background: 'transparent', color: T.textSecondary, border: `1px solid ${T.border}` },
    danger: { background: T.danger, color: '#fff' },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function FormInput({ label, value, onChange, type = 'text', placeholder, theme }) {
  const T = theme.palette; const R = theme.borderRadius;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', color: T.textSecondary, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: theme.fontBody }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: '100%', background: T.bg, border: `1px solid ${T.border}`, borderRadius: R,
        color: T.text, padding: '10px 14px', fontFamily: theme.fontBody, fontSize: 14, outline: 'none',
      }} />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, theme }) {
  const T = theme.palette; const R = theme.borderRadius;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', color: T.textSecondary, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: theme.fontBody }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', background: T.bg, border: `1px solid ${T.border}`, borderRadius: R, color: T.text, padding: '10px 14px', fontFamily: theme.fontBody, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  {month:'Ene',revenue:892000},{month:'Feb',revenue:856000},{month:'Mar',revenue:934000},
  {month:'Abr',revenue:978000},{month:'May',revenue:1020000},{month:'Jun',revenue:1150000},
  {month:'Jul',revenue:1080000},{month:'Ago',revenue:1220000},{month:'Sep',revenue:986000},
  {month:'Oct',revenue:1340000},{month:'Nov',revenue:1560000},{month:'Dic',revenue:1890000},
];

function generate90Days() {
  const data = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isFri = dow === 5;
    let base = 45000 + Math.random() * 30000;
    if (isWeekend) base *= 1.3; if (isFri) base *= 1.2;
    const revenue = Math.round(base);
    const profit = Math.round(revenue * 0.3);
    const orders = Math.round(revenue / 380);
    data.push({ date: d.toISOString().split('T')[0], dow, revenue, profit, orders, label: d.toLocaleDateString('es-MX',{month:'short',day:'numeric'}) });
  }
  return data;
}
const ALL_90_DAYS = generate90Days();

const HOUR_DATA = [
  {hour:'10h',orders:12,revenue:4560},{hour:'11h',orders:18,revenue:6840},
  {hour:'12h',orders:34,revenue:12920},{hour:'13h',orders:67,revenue:25460},
  {hour:'14h',orders:89,revenue:33820},{hour:'15h',orders:72,revenue:27360},
  {hour:'16h',orders:28,revenue:10640},{hour:'17h',orders:21,revenue:7980},
  {hour:'18h',orders:19,revenue:7220},{hour:'19h',orders:45,revenue:17100},
  {hour:'20h',orders:78,revenue:29640},{hour:'21h',orders:94,revenue:35720},
  {hour:'22h',orders:83,revenue:31540},{hour:'23h',orders:41,revenue:15580},
];

const DISH_DATA = [
  {name:'Ceviche Mediterráneo',cat:'Entradas',units:247,revenue:60515,cost:22085,margin:63},
  {name:'Pulpo a la Brasa',cat:'Principales',units:189,revenue:71820,cost:32319,margin:55},
  {name:'Risotto de Hongos',cat:'Principales',units:156,revenue:46020,cost:18408,margin:60},
  {name:'Salmón Mediterráneo',cat:'Principales',units:134,revenue:48910,cost:22010,margin:55},
  {name:'Sangría de la Casa',cat:'Bebidas',units:312,revenue:45240,cost:13572,margin:70},
  {name:'Tiramisú Artesanal',cat:'Postres',units:203,revenue:27405,cost:10374,margin:62},
  {name:'Lubina al Horno',cat:'Principales',units:98,revenue:41160,cost:21402,margin:48},
  {name:'Tabla de Quesos',cat:'Entradas',units:167,revenue:30895,cost:16964,margin:45},
  {name:'Bruschetta de Tomate',cat:'Entradas',units:289,revenue:36125,cost:18788,margin:48},
  {name:'Agua de Jamaica',cat:'Bebidas',units:445,revenue:28925,cost:8678,margin:70},
];

const CAT_DATA = [
  {name:'Principales',value:45},{name:'Bebidas',value:25},
  {name:'Entradas',value:20},{name:'Postres',value:10},
];

// ─── NAV CONFIG ──────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',Icon:LayoutDashboard,label:'Dashboard'},
  {id:'crm',Icon:Users,label:'CRM & Lealtad'},
  {id:'menu',Icon:UtensilsCrossed,label:'Menú & QR'},
  {id:'compras',Icon:ShoppingCart,label:'Compras'},
  {id:'reporteo',Icon:BarChart2,label:'Reporteo'},
  {id:'ia-ops',Icon:Cpu,label:'IA Operativa'},
  {id:'inventario',Icon:Package,label:'Inventario'},
  {id:'whatsapp',Icon:MessageCircle,label:'WhatsApp Hub'},
  {id:'reputacion',Icon:Star,label:'Reputación'},
  {id:'copilot',Icon:Bot,label:'Copilot IA'},
  {id:'marca',Icon:Palette,label:'Mi Marca'},
];
const BOTTOM_NAV = ['dashboard','menu','compras','reporteo','copilot'];

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: DASHBOARD
// ════════════════════════════════════════════════════════════════════════════════
function ModuleDashboard({ theme, addToast }) {
  const T = theme.palette; const R = theme.borderRadius;
  const fmt = v => '$' + v.toLocaleString('es-MX');
  const kpis = [
    {label:'Venta del día',value:'$48,320',delta:'+12%',trend:'up',sub:'vs ayer $43,143'},
    {label:'Ticket promedio',value:'$387',delta:'+5%',trend:'up',sub:'vs ayer $369'},
    {label:'Utilidad estimada',value:'$14,496',delta:'30%',trend:'neutral',sub:'margen del día'},
    {label:'Merma total',value:'$2,140',delta:'-8%',trend:'up',sub:'mejor que ayer'},
  ];
  const branches = [
    {name:'ESCA Centro',status:'green',revenue:'$22,100',note:'Operando con normalidad'},
    {name:'ESCA Polanco',status:'yellow',revenue:'$18,920',note:'⚠ Mesa 7 sin cerrar 2.5h'},
    {name:'ESCA Santa Fe',status:'red',revenue:'$7,300',note:'🚨 Sistema POS offline'},
  ];
  const alerts = [
    {text:'Camarones escasean — compra recomendada para hoy antes del fin de semana'},
    {text:'Martes es tu día más bajo (−34%) — activa promoción 2×1 esta semana'},
    {text:'Ana Ramírez (Platinum) lleva 52 días sin visitar — contactar hoy'},
  ];
  const statusColor = {green:T.success, yellow:T.warning, red:T.danger};

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>Dashboard</h2>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:24}}>
        {kpis.map((k,i) => (
          <Card key={i} theme={theme}>
            <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>{k.label}</div>
            <div style={{color:T.text,fontSize:26,fontFamily:theme.font,fontWeight:700,marginBottom:4}}>{k.value}</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{color:k.trend==='up'?T.success:k.trend==='down'?T.danger:T.textSecondary,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:3}}>
                {k.trend==='up'?<TrendingUp size={13}/>:k.trend==='down'?<TrendingDown size={13}/>:null}{k.delta}
              </span>
              <span style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>{k.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:20,marginBottom:24}}>
        {/* Chart */}
        <Card theme={theme} style={{minWidth:0}}>
          <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Ingresos 12 meses</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} margin={{top:0,right:0,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="month" stroke={T.textSecondary} tick={{fontSize:12,fill:T.textSecondary}} axisLine={false} tickLine={false}/>
              <YAxis stroke={T.textSecondary} tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000000?`$${(v/1000000).toFixed(1)}M`:v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
              <Tooltip formatter={v=>['$'+v.toLocaleString(),'Ingresos']} contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:theme.fontBody}}/>
              <Bar dataKey="revenue" fill={T.chartPrimary} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        {/* hide on very small */}
      </div>

      {/* Branches */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:24}}>
        {branches.map((b,i) => (
          <Card key={i} theme={theme}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{color:T.text,fontFamily:theme.fontBody,fontWeight:600,fontSize:15}}>{b.name}</span>
              <span style={{width:10,height:10,borderRadius:'50%',background:statusColor[b.status],display:'inline-block'}}/>
            </div>
            <div style={{color:T.accent,fontFamily:theme.font,fontSize:22,fontWeight:700,marginBottom:4}}>{b.revenue}</div>
            <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>{b.note}</div>
          </Card>
        ))}
      </div>

      {/* Copilot Alerts */}
      <Card theme={theme}>
        <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:14}}>🤖 Alertas del Copilot</div>
        {alerts.map((a,i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:i<alerts.length-1?`1px solid ${T.border}`:'none',gap:12,flexWrap:'wrap'}}>
            <div style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,flex:1}}>{a.text}</div>
            <Btn theme={theme} variant="secondary" small onClick={()=>addToast('Acción ejecutada','success')}>Actuar</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: CRM
// ════════════════════════════════════════════════════════════════════════════════
function ModuleCRM({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [tab, setTab] = useState('clients');
  const [recoverModal, setRecoverModal] = useState(null);

  const clients = [
    {id:1,name:'Ana Ramírez',tier:'Platinum',visits:47,spend:52840,lastVisit:52,avatar:'AR'},
    {id:2,name:'Carlos Vega',tier:'Gold',visits:23,spend:28100,lastVisit:3,avatar:'CV'},
    {id:3,name:'María Pérez',tier:'Gold',visits:18,spend:21500,lastVisit:1,avatar:'MP'},
    {id:4,name:'Sofía Luna',tier:'Silver',visits:9,spend:9240,lastVisit:12,avatar:'SL'},
    {id:5,name:'Roberto Kim',tier:'Silver',visits:7,spend:7890,lastVisit:8,avatar:'RK'},
    {id:6,name:'Diana Torres',tier:'Base',visits:3,spend:2100,lastVisit:31,avatar:'DT'},
    {id:7,name:'Javier Cruz',tier:'Base',visits:2,spend:1800,lastVisit:45,avatar:'JC'},
    {id:8,name:'Paloma Ruiz',tier:'Platinum',visits:38,spend:44200,lastVisit:2,avatar:'PR'},
  ];

  const tierColors = {Platinum:{bg:'rgba(124,58,237,0.15)',color:'#7C3AED'},Gold:{bg:'rgba(212,137,26,0.15)',color:'#D4891A'},Silver:{bg:'rgba(107,114,128,0.15)',color:'#9CA3AF'},Base:{bg:'rgba(156,163,175,0.1)',color:'#6B7280'}};

  const campaigns = [
    {name:'Martes Mágico 2×1',sent:847,open:'68%',conv:'12%',status:'active'},
    {name:'Regresa! Te extrañamos',sent:234,open:'45%',conv:'8%',status:'completed'},
    {name:'Nuevo Menú Primavera',sent:1203,open:'72%',conv:'18%',status:'active'},
  ];

  const tabs = [{key:'clients',label:'Clientes'},{key:'campaigns',label:'Campañas'},{key:'loyalty',label:'Lealtad'}];

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>CRM & Lealtad</h2>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,overflowX:'auto',borderBottom:`1px solid ${T.border}`,paddingBottom:0}}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'10px 20px',background:'none',border:'none',borderBottom:`2px solid ${tab===t.key?T.accent:'transparent'}`,color:tab===t.key?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===t.key?600:400,whiteSpace:'nowrap',transition:'all 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clients' && (
        <Card theme={theme} style={{overflowX:'auto',padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Cliente','Tier','Visitas','Gasto Total','Última visita',''].map(h => (
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:T.accentLight,display:'flex',alignItems:'center',justifyContent:'center',color:T.accent,fontSize:12,fontWeight:700}}>{c.avatar}</div>
                      <span style={{color:T.text,fontWeight:500,fontSize:14}}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px'}}><Badge label={c.tier} {...tierColors[c.tier]} /></td>
                  <td style={{padding:'14px 16px',color:T.textSecondary,fontSize:14}}>{c.visits}</td>
                  <td style={{padding:'14px 16px',color:T.text,fontSize:14,fontWeight:600}}>${c.spend.toLocaleString()}</td>
                  <td style={{padding:'14px 16px',color:c.lastVisit>30?T.danger:T.textSecondary,fontSize:13}}>hace {c.lastVisit} días</td>
                  <td style={{padding:'14px 16px'}}>
                    {c.lastVisit > 30 && (
                      <Btn theme={theme} variant="danger" small onClick={()=>setRecoverModal(c)}>Recuperar</Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'campaigns' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
            <Btn theme={theme} onClick={()=>addToast('Próximamente: constructor de campañas','info')}><Plus size={14}/> Nueva Campaña</Btn>
          </div>
          <Card theme={theme} style={{overflowX:'auto',padding:0}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {['Campaña','Enviados','Apertura','Conversiones','Estado'].map(h=>(
                    <th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c,i) => (
                  <tr key={i} style={{borderBottom:i<campaigns.length-1?`1px solid ${T.border}`:'none'}}>
                    <td style={{padding:'14px 16px',color:T.text,fontWeight:500,fontSize:14}}>{c.name}</td>
                    <td style={{padding:'14px 16px',color:T.textSecondary,fontSize:14}}>{c.sent.toLocaleString()}</td>
                    <td style={{padding:'14px 16px',color:T.success,fontSize:14,fontWeight:600}}>{c.open}</td>
                    <td style={{padding:'14px 16px',color:T.accent,fontSize:14,fontWeight:600}}>{c.conv}</td>
                    <td style={{padding:'14px 16px'}}>
                      <Badge label={c.status==='active'?'Activa':'Completada'} color={c.status==='active'?T.success:'#9CA3AF'} bg={c.status==='active'?'rgba(76,175,80,0.12)':'rgba(156,163,175,0.1)'}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'loyalty' && (
        <div style={{display:'grid',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
            {[{label:'Puntos activos',value:'284,720'},{label:'Canjes este mes',value:'47'},{label:'Gasto Gold avg',value:'$1,234/visita'}].map((s,i) => (
              <Card key={i} theme={theme}>
                <div style={{color:T.textSecondary,fontSize:12,marginBottom:6,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody}}>{s.label}</div>
                <div style={{color:T.text,fontSize:24,fontFamily:theme.font,fontWeight:700}}>{s.value}</div>
              </Card>
            ))}
          </div>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:14}}>Estructura de Tiers</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Tier','Visitas mínimas','Gasto mínimo','Beneficios'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[['Base','0','—','Menú digital'],['Silver','5','$5,000','5% descuento'],['Gold','15','$15,000','10% + mesa preferencial'],['Platinum','30','$30,000','15% + chef\'s table']].map(([t,v,g,b],i) => (
                  <tr key={i} style={{borderBottom:i<3?`1px solid ${T.border}`:'none'}}>
                    {[t,v,g,b].map((cell,j) => <td key={j} style={{padding:'12px 12px',color:j===0?T.accent:T.text,fontSize:13,fontWeight:j===0?700:400}}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{color:T.textSecondary,fontSize:12,marginTop:12,fontFamily:theme.fontBody}}>1 punto por cada $10 gastados · 100 puntos = $50 de descuento</p>
          </Card>
        </div>
      )}

      {/* Recover Modal */}
      <Modal open={!!recoverModal} onClose={()=>setRecoverModal(null)} title={`Recuperar a ${recoverModal?.name}`} theme={theme} isMobile={isMobile}>
        {recoverModal && <>
          <p style={{color:T.textSecondary,fontFamily:theme.fontBody,fontSize:14,marginBottom:16,lineHeight:1.6}}>
            Mensaje sugerido:
          </p>
          <div style={{background:T.accentLight,borderRadius:R,padding:16,fontFamily:theme.fontBody,fontSize:14,color:T.text,lineHeight:1.7,marginBottom:20}}>
            Hola {recoverModal.name.split(' ')[0]}! 👋 Te extrañamos en ESCA. Ha pasado un tiempo desde tu última visita y queremos invitarte a regresar con un <strong>20% de descuento</strong> en tu próxima visita. ¡Te esperamos! 🌿
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <Btn theme={theme} onClick={()=>{window.open(`https://wa.me/525512345678?text=Hola+${recoverModal.name.split(' ')[0]}%21+Te+extrañamos+en+ESCA`,'_blank');addToast('Abriendo WhatsApp','info');}}>📱 Enviar WhatsApp</Btn>
            <Btn theme={theme} variant="secondary" onClick={()=>{window.open(`mailto:?subject=Te extrañamos en ESCA&body=Hola ${recoverModal.name}!`);addToast('Abriendo correo','info');}}>📧 Enviar Email</Btn>
          </div>
        </>}
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: MENÚ & QR
// ════════════════════════════════════════════════════════════════════════════════
function ModuleMenu({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [selectedCat, setSelectedCat] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dishModal, setDishModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('🍽️');

  const [categories, setCategories] = useState([
    {id:'all',name:'Todo',emoji:'🍽️'},
    {id:'entradas',name:'Entradas',emoji:'🥗'},
    {id:'principales',name:'Principales',emoji:'🥩'},
    {id:'bebidas',name:'Bebidas',emoji:'🍷'},
    {id:'postres',name:'Postres',emoji:'🍰'},
  ]);

  const [dishes, setDishes] = useState([
    {id:1,name:'Ceviche Mediterráneo',desc:'Camarones y pulpo marinados en limón, con aguacate y tomate cherry',price:245,category:'entradas',tags:['Sin Gluten'],available:true,featured:true},
    {id:2,name:'Pulpo a la Brasa',desc:'Pulpo entero asado con aceite de oliva, pimentón y papas confitadas',price:380,category:'principales',tags:['Picante'],available:true,featured:true},
    {id:3,name:'Risotto de Hongos',desc:'Arroz arborio con hongos silvestres, parmesano y trufa negra',price:295,category:'principales',tags:['Vegano'],available:true,featured:false},
    {id:4,name:'Lubina al Horno',desc:'Lubina entera al horno con hierbas mediterráneas y limón',price:420,category:'principales',tags:[],available:true,featured:false},
    {id:5,name:'Tabla de Quesos',desc:'Selección de quesos artesanales con mermelada y nueces',price:185,category:'entradas',tags:['Sin Gluten'],available:true,featured:false},
    {id:6,name:'Tiramisú Artesanal',desc:'Receta original italiana con mascarpone y espresso',price:135,category:'postres',tags:[],available:true,featured:true},
    {id:7,name:'Sangría de la Casa',desc:'Vino tinto con frutas frescas de temporada',price:145,category:'bebidas',tags:[],available:true,featured:false},
    {id:8,name:'Agua de Jamaica',desc:'Agua fresca de flor de jamaica con hierbabuena',price:65,category:'bebidas',tags:['Vegano','Sin Gluten'],available:true,featured:false},
    {id:9,name:'Salmón Mediterráneo',desc:'Filete de salmón en costra de hierbas con puré de coliflor',price:365,category:'principales',tags:[],available:true,featured:false},
    {id:10,name:'Bruschetta de Tomate',desc:'Pan artesanal con tomate cherry confitado y albahaca fresca',price:125,category:'entradas',tags:['Vegano'],available:true,featured:false},
  ]);

  const [form, setForm] = useState({name:'',desc:'',price:'',category:'entradas',tags:[],available:true,featured:false});
  const allTags = ['Vegano','Sin Gluten','Picante','Orgánico'];
  const tagColors = {'Vegano':'#4CAF50','Sin Gluten':'#2196F3','Picante':'#F44336','Orgánico':'#8BC34A'};

  const filtered = selectedCat === 'all' ? dishes : dishes.filter(d => d.category === selectedCat);

  const openNew = () => { setEditDish(null); setForm({name:'',desc:'',price:'',category:'entradas',tags:[],available:true,featured:false}); setDishModal(true); };
  const openEdit = d => { setEditDish(d); setForm({...d,price:String(d.price)}); setDishModal(true); };
  const saveDish = () => {
    if (!form.name || !form.price) return;
    const d = {...form, price: Number(form.price), id: editDish?.id || Date.now()};
    if (editDish) setDishes(p => p.map(x => x.id === editDish.id ? d : x));
    else setDishes(p => [...p, d]);
    setDishModal(false);
    addToast(editDish ? 'Platillo actualizado' : 'Platillo creado');
  };
  const deleteDish = () => { setDishes(p => p.filter(d => d.id !== deleteId)); setDeleteId(null); addToast('Platillo eliminado','error'); };

  const EMOJIS = ['🍽️','🥗','🥩','🍷','🍰','🐟','🍜','🍣','🥘','🍝','🥦','🍋','🫐','🥑','🍊','🧀','🥚','🍗','🥩','🍤'];

  const accentHex = T.accent.replace('#','');

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,margin:0}}>Menú & QR</h2>
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="secondary" onClick={()=>setPreviewOpen(true)}><Eye size={14}/> Vista previa</Btn>
          <Btn theme={theme} onClick={openNew}><Plus size={14}/> Nuevo platillo</Btn>
        </div>
      </div>

      {/* Category chips */}
      <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:20,paddingBottom:4}}>
        {categories.map(c => (
          <button key={c.id} onClick={()=>setSelectedCat(c.id)} style={{
            background:selectedCat===c.id?T.accent:T.bgCard,color:selectedCat===c.id?'#fff':T.textSecondary,
            border:`1px solid ${selectedCat===c.id?T.accent:T.border}`,borderRadius:100,
            padding:'7px 16px',cursor:'pointer',fontFamily:theme.fontBody,fontSize:13,fontWeight:500,
            whiteSpace:'nowrap',transition:'all 0.15s',
          }}>{c.emoji} {c.name}</button>
        ))}
        <button onClick={()=>setCatModal(true)} style={{background:'transparent',border:`1px dashed ${T.border}`,borderRadius:100,padding:'7px 14px',cursor:'pointer',color:T.textSecondary,fontSize:13,whiteSpace:'nowrap',fontFamily:theme.fontBody}}>+ Añadir</button>
      </div>

      {/* Dishes grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,marginBottom:28}}>
        {filtered.map(d => (
          <Card key={d.id} theme={theme} style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,lineHeight:1.2}}>{d.name}</span>
              {d.featured && <span style={{color:'#D4891A',fontSize:18}}>⭐</span>}
            </div>
            <p style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,lineHeight:1.5,margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{d.desc}</p>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {d.tags.map(tag => <span key={tag} style={{background:`${tagColors[tag]}20`,color:tagColors[tag],padding:'2px 8px',borderRadius:100,fontSize:11,fontWeight:600}}>{tag}</span>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto',paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              <span style={{color:T.accent,fontFamily:theme.font,fontSize:22,fontWeight:700}}>${d.price}</span>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button onClick={()=>setDishes(p=>p.map(x=>x.id===d.id?{...x,available:!x.available}:x))} style={{background:d.available?'rgba(76,175,80,0.12)':'rgba(239,83,80,0.1)',border:'none',borderRadius:100,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:700,color:d.available?T.success:T.danger,fontFamily:theme.fontBody}}>
                  {d.available?'● Activo':'○ Inactivo'}
                </button>
                <button onClick={()=>openEdit(d)} style={{background:T.accentLight,border:'none',borderRadius:6,padding:'6px 8px',cursor:'pointer',color:T.accent}}><Edit2 size={13}/></button>
                <button onClick={()=>setDeleteId(d.id)} style={{background:'rgba(192,57,43,0.1)',border:'none',borderRadius:6,padding:'6px 8px',cursor:'pointer',color:T.danger}}><Trash2 size={13}/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* QR Section */}
      <Card theme={theme}>
        <div style={{display:'flex',flexWrap:'wrap',gap:24,alignItems:'center'}}>
          <div>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:4}}>Código QR del Menú</div>
            <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:16}}>Comparte tu menú digital con un escaneo</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <Btn theme={theme} small onClick={()=>addToast('QR descargado','success')}><Download size={13}/> Descargar</Btn>
              <Btn theme={theme} variant="secondary" small onClick={()=>{navigator.clipboard?.writeText('https://menu.restoos.app/esca');addToast('Enlace copiado');}}>
                <Copy size={13}/> Copiar enlace
              </Btn>
            </div>
          </div>
          <div style={{border:`2px solid ${T.border}`,borderRadius:R,padding:12,background:'#fff'}}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=${accentHex}&bgcolor=FFFFFF&data=https://menu.restoos.app/esca`} alt="QR" width={140} height={140} style={{display:'block',borderRadius:4}} />
          </div>
        </div>
      </Card>

      {/* Menu Preview Modal */}
      <Modal open={previewOpen} onClose={()=>setPreviewOpen(false)} title="Vista previa del menú" theme={theme} isMobile={isMobile} wide>
        <div style={{background:T.accent,padding:'20px 24px',borderRadius:R,marginBottom:20,textAlign:'center'}}>
          <div style={{color:'#fff',fontFamily:theme.font,fontSize:28,fontWeight:700}}>ESCA</div>
          <div style={{color:'rgba(255,255,255,0.75)',fontSize:13,fontFamily:theme.fontBody}}>Experiencia Mediterránea · CDMX</div>
        </div>
        <div style={{display:'flex',gap:8,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
          {categories.map(c=><button key={c.id} style={{background:T.accentLight,border:`1px solid ${T.accent}`,borderRadius:100,padding:'6px 14px',cursor:'pointer',color:T.accent,fontSize:12,whiteSpace:'nowrap',fontFamily:theme.fontBody}}>{c.emoji} {c.name}</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
          {dishes.filter(d=>d.available).map(d=>(
            <div key={d.id} style={{border:`1px solid ${T.border}`,borderRadius:R,padding:14}}>
              <div style={{color:T.text,fontFamily:theme.font,fontSize:16,fontWeight:600,marginBottom:4}}>{d.name} {d.featured?'⭐':''}</div>
              <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody,marginBottom:8,lineHeight:1.4}}>{d.desc}</div>
              <div style={{color:T.accent,fontFamily:theme.font,fontSize:20,fontWeight:700}}>${d.price}</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Dish Modal */}
      <Modal open={dishModal} onClose={()=>setDishModal(false)} title={editDish?'Editar platillo':'Nuevo platillo'} theme={theme} isMobile={isMobile}>
        <FormInput label="Nombre *" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} theme={theme} />
        <FormInput label="Descripción" value={form.desc} onChange={v=>setForm(p=>({...p,desc:v}))} theme={theme} />
        <FormInput label="Precio (MXN) *" value={form.price} onChange={v=>setForm(p=>({...p,price:v}))} type="number" theme={theme} />
        <FormSelect label="Categoría" value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} options={categories.filter(c=>c.id!=='all').map(c=>({value:c.id,label:`${c.emoji} ${c.name}`}))} theme={theme} />
        <div style={{marginBottom:16}}>
          <label style={{display:'block',color:T.textSecondary,fontSize:12,marginBottom:8,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody}}>Etiquetas</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {allTags.map(tag=>(
              <label key={tag} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontFamily:theme.fontBody,fontSize:13,color:T.text}}>
                <input type="checkbox" checked={form.tags.includes(tag)} onChange={e=>{const t=e.target.checked?[...form.tags,tag]:form.tags.filter(x=>x!==tag);setForm(p=>({...p,tags:t}));}} />
                {tag}
              </label>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:20,marginBottom:20}}>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:theme.fontBody,color:T.text,fontSize:14}}>
            <input type="checkbox" checked={form.available} onChange={e=>setForm(p=>({...p,available:e.target.checked}))} /> Disponible
          </label>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:theme.fontBody,color:T.text,fontSize:14}}>
            <input type="checkbox" checked={form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} /> ⭐ Destacado
          </label>
        </div>
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="ghost" onClick={()=>setDishModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn theme={theme} onClick={saveDish} style={{flex:1}}>Guardar</Btn>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={()=>setDeleteId(null)} title="Eliminar platillo" theme={theme} isMobile={isMobile}>
        <p style={{color:T.textSecondary,fontFamily:theme.fontBody,marginBottom:24}}>¿Eliminar este platillo? Esta acción no se puede deshacer.</p>
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="ghost" onClick={()=>setDeleteId(null)} style={{flex:1}}>Cancelar</Btn>
          <Btn theme={theme} variant="danger" onClick={deleteDish} style={{flex:1}}>Eliminar</Btn>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal open={catModal} onClose={()=>setCatModal(false)} title="Nueva categoría" theme={theme} isMobile={isMobile}>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',color:T.textSecondary,fontSize:12,marginBottom:8,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody}}>Emoji</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:6}}>
            {EMOJIS.map(e=><button key={e} onClick={()=>setCatEmoji(e)} style={{background:catEmoji===e?T.accentLight:'transparent',border:`1px solid ${catEmoji===e?T.accent:T.border}`,borderRadius:6,padding:6,cursor:'pointer',fontSize:18,textAlign:'center'}}>{e}</button>)}
          </div>
        </div>
        <FormInput label="Nombre" value={catName} onChange={setCatName} theme={theme} placeholder="Ej. Mariscos" />
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="ghost" onClick={()=>setCatModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn theme={theme} onClick={()=>{if(!catName)return;setCategories(p=>[...p,{id:catName.toLowerCase().replace(/\s+/g,'-'),name:catName,emoji:catEmoji}]);setCatModal(false);setCatName('');addToast('Categoría creada');}} style={{flex:1}}>Crear</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: COMPRAS
// ════════════════════════════════════════════════════════════════════════════════
function ModuleCompras({ theme, addToast, isMobile, onPendingChange }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([
    {id:'OC-001',supply:'Camarones Tiger',qty:10,unit:'kg',supplier:'FreshMar',supplierEmail:'contacto@freshmar.mx',unitPrice:385,total:3850,status:'pending',date:'2026-05-25'},
    {id:'OC-002',supply:'Salmón',qty:8,unit:'kg',supplier:'FreshMar',supplierEmail:'contacto@freshmar.mx',unitPrice:420,total:3360,status:'pending',date:'2026-05-25'},
    {id:'OC-003',supply:'Aceite de Oliva',qty:10,unit:'L',supplier:'OlivasBest',supplierEmail:'pedidos@olivasbest.mx',unitPrice:145,total:1450,status:'approved',date:'2026-05-24'},
    {id:'OC-004',supply:'Vino Tinto',qty:12,unit:'btl',supplier:'VinoCava',supplierEmail:'pedidos@vinocava.mx',unitPrice:320,total:3840,status:'rejected',date:'2026-05-23'},
  ]);
  const [emailModal, setEmailModal] = useState(null);
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({supply:'Camarones Tiger',qty:'',unit:'kg',supplier:'FreshMar',supplierEmail:'contacto@freshmar.mx',unitPrice:385,notes:''});
  const [copied, setCopied] = useState(false);

  const supplies = [
    {name:'Camarones Tiger',unit:'kg',price:385,stock:2.5,minimum:5,supplier:'FreshMar',supplierEmail:'contacto@freshmar.mx'},
    {name:'Res Premium',unit:'kg',price:280,stock:12,minimum:8,supplier:'CarniPremium',supplierEmail:'ventas@carnipremium.mx'},
    {name:'Aceite de Oliva',unit:'L',price:145,stock:3,minimum:4,supplier:'OlivasBest',supplierEmail:'pedidos@olivasbest.mx'},
    {name:'Vino Tinto',unit:'btl',price:320,stock:8,minimum:6,supplier:'VinoCava',supplierEmail:'pedidos@vinocava.mx'},
    {name:'Queso Manchego',unit:'kg',price:185,stock:4,minimum:3,supplier:'OlivasBest',supplierEmail:'pedidos@olivasbest.mx'},
    {name:'Salmón',unit:'kg',price:420,stock:1.5,minimum:4,supplier:'FreshMar',supplierEmail:'contacto@freshmar.mx'},
    {name:'Harina',unit:'kg',price:45,stock:25,minimum:10,supplier:'CarniPremium',supplierEmail:'ventas@carnipremium.mx'},
    {name:'Jitomates',unit:'kg',price:35,stock:8,minimum:5,supplier:'OlivasBest',supplierEmail:'pedidos@olivasbest.mx'},
  ];

  const suppliers = [
    {name:'FreshMar',email:'contacto@freshmar.mx',phone:'55-1234-5678',products:'Mariscos, Pescados'},
    {name:'CarniPremium',email:'ventas@carnipremium.mx',phone:'55-8765-4321',products:'Carnes, Aves'},
    {name:'OlivasBest',email:'pedidos@olivasbest.mx',phone:'55-2345-6789',products:'Aceites, Conservas'},
    {name:'VinoCava',email:'pedidos@vinocava.mx',phone:'55-3456-7890',products:'Vinos, Bebidas'},
  ];

  const pending = orders.filter(o => o.status === 'pending').length;

  const approve = (o) => {
    setOrders(p => p.map(x => x.id === o.id ? {...x, status:'approved'} : x));
    setEmailModal(o);
    if (onPendingChange) onPendingChange(orders.filter(x => x.status === 'pending' && x.id !== o.id).length);
  };

  const reject = (o) => {
    setOrders(p => p.map(x => x.id === o.id ? {...x, status:'rejected'} : x));
    addToast('Orden rechazada', 'error');
    if (onPendingChange) onPendingChange(orders.filter(x => x.status === 'pending' && x.id !== o.id).length);
  };

  const getEmailBody = (o) => {
    if (!o) return '';
    const delivDate = new Date(); delivDate.setDate(delivDate.getDate() + 3);
    const fmtDate = delivDate.toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    return `Para: ${o.supplierEmail}\nAsunto: Orden de Compra ${o.id} — ESCA Restaurante\n\nEstimado equipo de ${o.supplier},\n\nPor medio de la presente, les confirmamos la aprobación de la siguiente orden de compra:\n\n• Producto: ${o.supply}\n• Cantidad: ${o.qty} ${o.unit}\n• Precio unitario: $${o.unitPrice}/${o.unit}\n• Total: $${o.total.toLocaleString()}\n• Fecha de entrega requerida: ${fmtDate}\n• Número de orden: ${o.id}\n\nPor favor confirmar la recepción de esta orden e indicar la fecha estimada de entrega.\n\nAtentamente,\nEquipo de Compras\nESCA Restaurante\nTel: 55-5555-1234`;
  };

  const statusBadge = s => {
    const m = {pending:{bg:'rgba(255,152,0,0.12)',color:'#FF9800',label:'Pendiente'},approved:{bg:'rgba(76,175,80,0.12)',color:'#4CAF50',label:'Aprobada'},rejected:{bg:'rgba(239,83,80,0.12)',color:'#EF5350',label:'Rechazada'}};
    const x = m[s]||m.pending;
    return <Badge label={x.label} bg={x.bg} color={x.color} />;
  };

  const getGaugeColor = (stock, min) => {
    const pct = (stock/min)*100;
    if (pct < 100) return T.danger;
    if (pct < 150) return T.warning;
    return T.success;
  };

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,margin:0}}>
          Compras {pending > 0 && <span style={{background:T.danger,color:'#fff',borderRadius:100,padding:'2px 8px',fontSize:13,marginLeft:8}}>{pending}</span>}
        </h2>
        <Btn theme={theme} onClick={()=>setNewOrderModal(true)}><Plus size={14}/> Nueva Solicitud</Btn>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,borderBottom:`1px solid ${T.border}`,marginBottom:20}}>
        {[{k:'orders',l:'Órdenes'},{k:'supplies',l:'Insumos'},{k:'suppliers',l:'Proveedores'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'10px 20px',background:'none',border:'none',borderBottom:`2px solid ${tab===t.k?T.accent:'transparent'}`,color:tab===t.k?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===t.k?600:400,transition:'all 0.2s'}}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {orders.map(o => (
            <Card key={o.id} theme={theme}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <span style={{color:T.accent,fontFamily:theme.font,fontSize:18,fontWeight:700}}>{o.id}</span>
                    {statusBadge(o.status)}
                  </div>
                  <div style={{color:T.text,fontSize:15,fontFamily:theme.fontBody,fontWeight:500}}>{o.supply}</div>
                  <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginTop:2}}>{o.qty} {o.unit} · {o.supplier} · {o.date}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:T.text,fontFamily:theme.font,fontSize:22,fontWeight:700}}>${o.total.toLocaleString()}</div>
                  {o.status === 'pending' && (
                    <div style={{display:'flex',gap:8,marginTop:8,justifyContent:'flex-end'}}>
                      <Btn theme={theme} small variant="ghost" onClick={()=>reject(o)}>✕ Rechazar</Btn>
                      <Btn theme={theme} small onClick={()=>approve(o)}>✓ Aprobar</Btn>
                    </div>
                  )}
                  {o.status === 'approved' && <Btn theme={theme} small variant="secondary" onClick={()=>setEmailModal(o)}><Mail size={13}/> Ver email</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'supplies' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {supplies.map((s,i) => {
            const pct = Math.min((s.stock/s.minimum)*200,200);
            const gc = getGaugeColor(s.stock, s.minimum);
            return (
              <Card key={i} theme={theme}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,flexWrap:'wrap',gap:8}}>
                  <span style={{color:T.text,fontFamily:theme.fontBody,fontWeight:600,fontSize:15}}>{s.name}</span>
                  <span style={{color:T.textSecondary,fontSize:13}}>${s.price}/{s.unit}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{flex:1,background:T.border,borderRadius:4,height:8,overflow:'hidden'}}>
                    <div style={{width:`${Math.min((s.stock/s.minimum)*100,100)}%`,background:gc,height:'100%',borderRadius:4,transition:'width 0.5s'}}/>
                  </div>
                  <span style={{color:gc,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>{s.stock}/{s.minimum} {s.unit}</span>
                  <span style={{color:gc,fontSize:16}}>{s.stock < s.minimum ? '🔴' : s.stock < s.minimum*1.5 ? '🟡' : '🟢'}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'suppliers' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {suppliers.map((s,i) => (
            <Card key={i} theme={theme}>
              <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:8}}>{s.name}</div>
              <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:4}}>✉ {s.email}</div>
              <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:8}}>📞 {s.phone}</div>
              <div style={{color:T.accent,fontSize:12,fontFamily:theme.fontBody,fontWeight:600}}>{s.products}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Email Modal */}
      <Modal open={!!emailModal} onClose={()=>setEmailModal(null)} title="Email al Proveedor" theme={theme} isMobile={isMobile} wide>
        {emailModal && <>
          <pre style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:R,padding:16,color:T.text,fontFamily:'monospace',fontSize:13,lineHeight:1.7,whiteSpace:'pre-wrap',marginBottom:20,overflowX:'auto'}}>{getEmailBody(emailModal)}</pre>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <Btn theme={theme} onClick={()=>{navigator.clipboard?.writeText(getEmailBody(emailModal));setCopied(true);addToast('Mensaje copiado');setTimeout(()=>setCopied(false),2000);}}><Copy size={14}/> {copied?'¡Copiado!':'Copiar mensaje'}</Btn>
            <Btn theme={theme} variant="secondary" onClick={()=>{const b=getEmailBody(emailModal);const[to,...rest]=b.split('\n');window.location.href=`mailto:${emailModal.supplierEmail}?subject=Orden de Compra ${emailModal.id} — ESCA&body=${encodeURIComponent(rest.slice(1).join('\n'))}`;addToast('Abriendo correo','info');}}>
              <Mail size={14}/> Abrir en correo
            </Btn>
          </div>
        </>}
      </Modal>

      {/* New Order Modal */}
      <Modal open={newOrderModal} onClose={()=>setNewOrderModal(false)} title="Nueva Solicitud de Compra" theme={theme} isMobile={isMobile}>
        <FormSelect label="Insumo" value={orderForm.supply} onChange={v=>{const s=supplies.find(x=>x.name===v)||supplies[0];setOrderForm(p=>({...p,supply:v,supplier:s.supplier,supplierEmail:s.supplierEmail,unit:s.unit,unitPrice:s.price}));}} options={supplies.map(s=>({value:s.name,label:s.name}))} theme={theme}/>
        <FormInput label="Cantidad" value={orderForm.qty} onChange={v=>setOrderForm(p=>({...p,qty:v}))} type="number" theme={theme}/>
        <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:16}}>Proveedor: <strong style={{color:T.text}}>{orderForm.supplier}</strong> · Precio: <strong style={{color:T.accent}}>${orderForm.unitPrice}/{orderForm.unit}</strong> · Total: <strong style={{color:T.text}}>${orderForm.qty?(Number(orderForm.qty)*orderForm.unitPrice).toLocaleString():0}</strong></div>
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="ghost" onClick={()=>setNewOrderModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn theme={theme} onClick={()=>{if(!orderForm.qty)return;const o={id:`OC-${String(orders.length+1).padStart(3,'0')}`,supply:orderForm.supply,qty:Number(orderForm.qty),unit:orderForm.unit,supplier:orderForm.supplier,supplierEmail:orderForm.supplierEmail,unitPrice:orderForm.unitPrice,total:Number(orderForm.qty)*orderForm.unitPrice,status:'pending',date:new Date().toISOString().split('T')[0]};setOrders(p=>[o,...p]);setNewOrderModal(false);addToast('Solicitud creada');if(onPendingChange)onPendingChange(pending+1);}} style={{flex:1}}>Crear Solicitud</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: REPORTEO
// ════════════════════════════════════════════════════════════════════════════════
function ModuleReporteo({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [range, setRange] = useState('30d');
  const [tab, setTab] = useState('resumen');

  const rangeData = useMemo(() => {
    const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return ALL_90_DAYS.slice(-days);
  }, [range]);

  const totals = useMemo(() => {
    const r = rangeData.reduce((a,d)=>({revenue:a.revenue+d.revenue,profit:a.profit+d.profit,orders:a.orders+d.orders}),{revenue:0,profit:0,orders:0});
    return {...r, margin: r.revenue ? Math.round((r.profit/r.revenue)*100) : 0, avgTicket: r.orders ? Math.round(r.revenue/r.orders) : 0};
  }, [rangeData]);

  const catColors = [T.chartPrimary, T.chartSecondary, T.chartTertiary, T.info];
  const dowData = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d,i)=>{
    const dow = (i+1)%7;
    const dd = ALL_90_DAYS.filter(x=>x.dow===dow);
    return {day:d, revenue:dd.reduce((a,x)=>a+x.revenue,0)/Math.max(dd.length,1)};
  });

  const heatmapDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const heatmapHours = Array.from({length:14},(_,i)=>i+10);
  const heatmapData = useMemo(()=>{
    const base = [[4,5,6,5,8,12,9],[5,6,8,7,9,14,11],[9,12,15,11,16,20,18],[18,22,25,20,28,35,30],[22,28,32,25,35,45,38],[18,22,26,20,28,36,32],[10,13,15,12,18,22,20],[8,10,12,10,14,18,16],[9,11,14,11,16,20,18],[22,27,32,25,35,42,36],[38,45,48,42,52,68,58],[48,55,60,52,65,82,70],[42,50,55,48,58,75,64],[22,28,32,25,35,44,38]];
    return base;
  },[]);

  const maxHeat = 82;
  const insights = [
    'Los jueves 21h tienen 34% menos tráfico que viernes — ideal para evento especial',
    'Lunes 10-11h son las horas más inactivas — considera brunch ejecutivo',
    'Martes 14h es el único slot de almuerzo bajo entre semana — menú ejecutivo de 45min podría triplicar la franja',
    'Domingos 12-14h son tu franja más productiva — garantiza staff completo y no aceptes reservas telefónicas en ese rango',
  ];

  const kpis = [
    {label:'Ingresos Totales',value:`$${(totals.revenue/1000000).toFixed(2)}M`,delta:'+12.4%',up:true},
    {label:'Ticket Promedio',value:`$${totals.avgTicket}`,delta:'+5.2%',up:true},
    {label:'Clientes Únicos',value:'1,284',delta:'+8.1%',up:true},
    {label:'Utilidad',value:`$${(totals.profit/1000).toFixed(0)}k`,delta:'+9.7%',up:true},
    {label:'Pedidos',value:totals.orders.toLocaleString(),delta:'+6.3%',up:true},
    {label:'Margen %',value:`${totals.margin}%`,delta:'-0.5%',up:false},
  ];

  const chartData = rangeData.length > 30
    ? rangeData.filter((_,i)=>i%3===0)
    : rangeData;

  const hexToRgb = hex => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '43,95,74';
  };
  const accentRgb = hexToRgb(T.chartPrimary);

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>Reporteo & Analytics</h2>

      {/* Filters */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center'}}>
        <div style={{display:'flex',gap:4,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:R,padding:4}}>
          {[['today','Hoy'],['7d','7 días'],['30d','30 días'],['90d','90 días']].map(([k,l])=>(
            <button key={k} onClick={()=>setRange(k)} style={{padding:'6px 14px',background:range===k?T.accent:'transparent',color:range===k?'#fff':T.textSecondary,border:'none',borderRadius:R,cursor:'pointer',fontFamily:theme.fontBody,fontSize:13,fontWeight:600,transition:'all 0.15s'}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,borderBottom:`1px solid ${T.border}`,marginBottom:20,overflowX:'auto'}}>
        {[['resumen','Resumen'],['platillos','Por Platillo'],['horas','Por Hora'],['sucursales','Sucursales'],['heatmap','Mapa de Calor']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 16px',background:'none',border:'none',borderBottom:`2px solid ${tab===k?T.accent:'transparent'}`,color:tab===k?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===k?600:400,whiteSpace:'nowrap',transition:'all 0.2s'}}>{l}</button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14}}>
            {kpis.map((k,i)=>(
              <Card key={i} theme={theme}>
                <div style={{color:T.textSecondary,fontSize:11,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:theme.fontBody}}>{k.label}</div>
                <div style={{color:T.text,fontSize:22,fontFamily:theme.font,fontWeight:700,marginBottom:4}}>{k.value}</div>
                <div style={{color:k.up?T.success:T.danger,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:3}}>
                  {k.up?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{k.delta} vs período ant.
                </div>
              </Card>
            ))}
          </div>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Ingresos vs Utilidad</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{left:-10,right:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                <XAxis dataKey="label" stroke={T.textSecondary} tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false}/>
                <YAxis stroke={T.textSecondary} tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={(v,n)=>['$'+v.toLocaleString(),n==='revenue'?'Ingresos':'Utilidad']} contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:theme.fontBody}}/>
                <Legend wrapperStyle={{fontFamily:theme.fontBody,fontSize:12,color:T.textSecondary}}/>
                <Line type="monotone" dataKey="revenue" stroke={T.chartPrimary} strokeWidth={2} dot={false} name="revenue"/>
                <Line type="monotone" dataKey="profit" stroke={T.chartSecondary} strokeWidth={2} dot={false} name="profit"/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Card theme={theme}>
              <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Por Categoría</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={CAT_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value})=>`${name} ${value}%`} labelLine={false}>
                    {CAT_DATA.map((_,i)=><Cell key={i} fill={catColors[i%catColors.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,fontFamily:theme.fontBody,color:T.text}}/>
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card theme={theme}>
              <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Por Día</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dowData} margin={{left:-20,right:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                  <XAxis dataKey="day" tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:T.textSecondary}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip formatter={v=>['$'+Math.round(v).toLocaleString(),'Ingresos']} contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,fontFamily:theme.fontBody,color:T.text}}/>
                  <Bar dataKey="revenue" fill={T.chartPrimary} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {tab === 'platillos' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Card theme={theme}><div style={{color:T.textSecondary,fontSize:12,marginBottom:4,fontFamily:theme.fontBody}}>Mayor Margen</div><div style={{color:T.text,fontFamily:theme.font,fontSize:16,fontWeight:700}}>🏆 Tiramisú Artesanal <span style={{color:T.success}}>62%</span></div></Card>
            <Card theme={theme}><div style={{color:T.textSecondary,fontSize:12,marginBottom:4,fontFamily:theme.fontBody}}>Mayor Volumen</div><div style={{color:T.text,fontFamily:theme.font,fontSize:16,fontWeight:700}}>📊 Ceviche Mediterráneo <span style={{color:T.info}}>247 uds</span></div></Card>
          </div>
          <Card theme={theme} style={{padding:0,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Platillo','Categoría','Unidades','Ingresos','Margen %'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {DISH_DATA.map((d,i)=>(
                  <tr key={i} style={{borderBottom:i<DISH_DATA.length-1?`1px solid ${T.border}`:'none'}}>
                    <td style={{padding:'12px 16px',color:T.text,fontSize:14,fontWeight:500}}>{d.name}</td>
                    <td style={{padding:'12px 16px',color:T.textSecondary,fontSize:13}}>{d.cat}</td>
                    <td style={{padding:'12px 16px',color:T.text,fontSize:14}}>{d.units}</td>
                    <td style={{padding:'12px 16px',color:T.text,fontSize:14}}>${d.revenue.toLocaleString()}</td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{color:d.margin>40?T.success:d.margin>20?T.warning:T.danger,fontWeight:700,fontSize:14}}>{d.margin}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'horas' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:4}}>Distribución por Hora</div>
            <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:16}}>Franja Pico: <strong style={{color:T.accent}}>20h–22h (32% de ingresos diarios)</strong></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={HOUR_DATA} margin={{left:-10,right:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                <XAxis dataKey="hour" tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:T.textSecondary}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>['$'+v.toLocaleString(),'Ingresos']} contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,fontFamily:theme.fontBody,color:T.text}}/>
                <Bar dataKey="revenue" radius={[4,4,0,0]}>
                  {HOUR_DATA.map((d,i)=><Cell key={i} fill={['20h','21h','22h'].includes(d.hour)?T.accent:T.chartSecondary}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card theme={theme} style={{padding:0,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Hora','Pedidos','Ingresos','% del Total'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>{h}</th>)}</tr></thead>
              <tbody>
                {HOUR_DATA.map((h,i)=>{const total=HOUR_DATA.reduce((a,x)=>a+x.revenue,0);const pct=((h.revenue/total)*100).toFixed(1);const isPeak=['20h','21h','22h'].includes(h.hour);return(
                  <tr key={i} style={{background:isPeak?T.accentLight:'transparent',borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:'11px 16px',color:isPeak?T.accent:T.text,fontWeight:isPeak?700:400,fontSize:14}}>{h.hour}{isPeak?' 🔥':''}</td>
                    <td style={{padding:'11px 16px',color:T.textSecondary,fontSize:14}}>{h.orders}</td>
                    <td style={{padding:'11px 16px',color:T.text,fontSize:14,fontWeight:600}}>${h.revenue.toLocaleString()}</td>
                    <td style={{padding:'11px 16px',color:T.textSecondary,fontSize:14}}>{pct}%</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'sucursales' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>
            {[{name:'ESCA Centro',revenue:'$542,100',orders:1421,star:'Ceviche Mediterráneo',delta:'+8%'},{name:'ESCA Polanco',revenue:'$489,200',orders:1287,star:'Pulpo a la Brasa',delta:'+5%'},{name:'ESCA Santa Fe',revenue:'$316,800',orders:834,star:'Risotto de Hongos',delta:'+3%'}].map((b,i)=>(
              <Card key={i} theme={theme}>
                <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:4}}>{b.name}</div>
                <div style={{color:T.accent,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:4}}>{b.revenue}</div>
                <div style={{color:T.textSecondary,fontSize:13,marginBottom:8,fontFamily:theme.fontBody}}>{b.orders.toLocaleString()} pedidos · <span style={{color:T.success}}>{b.delta}</span></div>
                <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>⭐ Estrella: <strong style={{color:T.text}}>{b.star}</strong></div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'heatmap' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:4}}>Mapa de Calor: Ingresos por Hora × Día</div>
            <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginBottom:16}}>Intensidad = nivel de ingresos relativo</div>
            <div style={{overflowX:'auto'}}>
              <div style={{minWidth:500}}>
                {/* Header row */}
                <div style={{display:'grid',gridTemplateColumns:`60px repeat(7,1fr)`,gap:3,marginBottom:3}}>
                  <div/>
                  {heatmapDays.map(d=><div key={d} style={{textAlign:'center',color:T.textSecondary,fontSize:11,fontWeight:600,padding:'4px 0',fontFamily:theme.fontBody}}>{d}</div>)}
                </div>
                {heatmapHours.map((hour,hi)=>(
                  <div key={hour} style={{display:'grid',gridTemplateColumns:`60px repeat(7,1fr)`,gap:3,marginBottom:3}}>
                    <div style={{color:T.textSecondary,fontSize:11,textAlign:'right',paddingRight:8,display:'flex',alignItems:'center',justifyContent:'flex-end',fontFamily:theme.fontBody}}>{hour}h</div>
                    {heatmapDays.map((_,di)=>{
                      const val=heatmapData[hi][di];
                      const intensity=val/maxHeat;
                      return(
                        <div key={di} title={`${heatmapDays[di]} ${hour}h: ${val}% intensidad`} style={{background:`rgba(${accentRgb},${0.08+intensity*0.92})`,borderRadius:4,height:28,cursor:'default',transition:'opacity 0.2s'}}/>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Scale */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}>
              <span style={{color:T.textSecondary,fontSize:11,fontFamily:theme.fontBody}}>Bajo</span>
              <div style={{flex:1,height:8,borderRadius:4,background:`linear-gradient(to right, rgba(${accentRgb},0.08), rgba(${accentRgb},1))`}}/>
              <span style={{color:T.textSecondary,fontSize:11,fontFamily:theme.fontBody}}>Alto</span>
            </div>
            <div style={{display:'flex',gap:16,marginTop:8,fontSize:12,color:T.textSecondary,fontFamily:theme.fontBody,flexWrap:'wrap'}}>
              <span>🔥 Hora más activa: <strong style={{color:T.text}}>Sábado 21h</strong></span>
              <span>💤 Hora más muerta: <strong style={{color:T.text}}>Lunes 10h</strong></span>
            </div>
          </Card>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:14}}>💡 Insights Accionables</div>
            {insights.map((ins,i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:i<insights.length-1?`1px solid ${T.border}`:'none'}}>
                <span style={{color:T.accent,fontSize:18,flexShrink:0}}>{['💡','⚡','🎯','🏆'][i]}</span>
                <p style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.6,margin:0}}>{ins}</p>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: IA OPERATIVA
// ════════════════════════════════════════════════════════════════════════════════
function ModuleIAOps({ theme, addToast }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [tab, setTab] = useState('forecast');
  const forecasts = [
    {dish:'Ceviche Mediterráneo',today:34,tomorrow:28,weekend:67,confidence:92,trend:'up'},
    {dish:'Pulpo a la Brasa',today:26,tomorrow:22,weekend:51,confidence:88,trend:'up'},
    {dish:'Risotto de Hongos',today:18,tomorrow:21,weekend:38,confidence:85,trend:'stable'},
    {dish:'Sangría de la Casa',today:45,tomorrow:38,weekend:89,confidence:94,trend:'up'},
    {dish:'Tiramisú Artesanal',today:22,tomorrow:19,weekend:44,confidence:87,trend:'down'},
  ];
  const fraudAlerts = [
    {sev:'high',msg:'Merma de camarones +180% sobre promedio histórico — posible desperdicio o faltante',action:'Revisar inventario'},
    {sev:'medium',msg:'8 descuentos aplicados por Diego Sánchez en los últimos 3 días — inusual vs. promedio de 2/semana',action:'Revisar permisos'},
    {sev:'medium',msg:'3 cortesías registradas esta semana sin código de autorización gerencial',action:'Auditar registros'},
    {sev:'low',msg:'Diferencia de $340 en caja chica del turno nocturno del martes',action:'Cuadrar caja'},
  ];
  const buyRecs = [
    {supply:'Camarones Tiger',qty:'10 kg',reason:'Precio histórico bajo ($385 vs avg $420) + alta demanda prevista el viernes',urgency:'Hoy'},
    {supply:'Salmón Atlántico',qty:'6 kg',reason:'Stock crítico (1.5 kg vs mínimo 4 kg) — riesgo de desabasto mañana',urgency:'Urgente'},
    {supply:'Aceite de Oliva',qty:'8 L',reason:'Agotamiento previsto en 2 días según consumo actual',urgency:'Mañana'},
  ];
  const matrix = {
    estrellas:['Ceviche Mediterráneo','Sangría de la Casa','Tiramisú Artesanal'],
    caballos:['Bruschetta de Tomate','Agua de Jamaica'],
    puzzles:['Lubina al Horno','Tabla de Quesos'],
    perros:[],
  };
  const sevColor = {high:T.danger,medium:T.warning,low:T.info};

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>IA Operativa</h2>
      <div style={{display:'flex',gap:4,borderBottom:`1px solid ${T.border}`,marginBottom:20,overflowX:'auto'}}>
        {[['forecast','Pronósticos'],['fraud','Fraude/Merma'],['buy','Recomendaciones'],['matrix','Menu Engineering']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 16px',background:'none',border:'none',borderBottom:`2px solid ${tab===k?T.accent:'transparent'}`,color:tab===k?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===k?600:400,whiteSpace:'nowrap',transition:'all 0.2s'}}>{l}</button>
        ))}
      </div>

      {tab === 'forecast' && (
        <Card theme={theme} style={{padding:0,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
            <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Platillo','Hoy','Mañana','Fin de semana','Confianza','Tendencia'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
            <tbody>
              {forecasts.map((f,i)=>(
                <tr key={i} style={{borderBottom:i<forecasts.length-1?`1px solid ${T.border}`:'none'}}>
                  <td style={{padding:'13px 16px',color:T.text,fontWeight:500,fontSize:14}}>{f.dish}</td>
                  <td style={{padding:'13px 16px',color:T.text,fontSize:14}}>{f.today}</td>
                  <td style={{padding:'13px 16px',color:T.text,fontSize:14}}>{f.tomorrow}</td>
                  <td style={{padding:'13px 16px',color:T.accent,fontWeight:700,fontSize:14}}>{f.weekend}</td>
                  <td style={{padding:'13px 16px'}}><span style={{color:f.confidence>90?T.success:T.warning,fontWeight:700,fontSize:13}}>{f.confidence}%</span></td>
                  <td style={{padding:'13px 16px',fontSize:18}}>{f.trend==='up'?'↑':f.trend==='down'?'↓':'→'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'fraud' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {fraudAlerts.map((a,i)=>(
            <Card key={i} theme={theme} style={{borderLeft:`4px solid ${sevColor[a.sev]}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div>
                  <Badge label={a.sev.toUpperCase()} color={sevColor[a.sev]} bg={`${sevColor[a.sev]}20`}/>
                  <p style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.6,margin:'8px 0 0'}}>{a.msg}</p>
                </div>
                <Btn theme={theme} small variant="secondary" onClick={()=>addToast(`Acción: ${a.action}`)}>{a.action}</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'buy' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {buyRecs.map((r,i)=>(
            <Card key={i} theme={theme}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:700}}>{r.supply}</span>
                    <Badge label={r.urgency} color={r.urgency==='Urgente'?T.danger:r.urgency==='Hoy'?T.warning:T.info} bg={`${r.urgency==='Urgente'?T.danger:r.urgency==='Hoy'?T.warning:T.info}20`}/>
                  </div>
                  <p style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,margin:'0 0 4px'}}>{r.qty}</p>
                  <p style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.5,margin:0}}>{r.reason}</p>
                </div>
                <Btn theme={theme} small onClick={()=>addToast('Solicitud de compra creada')}><Plus size={13}/> Crear Solicitud</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[
            {key:'estrellas',icon:'⭐',label:'Estrellas',desc:'Alta venta · Alto margen',color:T.success,bg:`${T.success}12`},
            {key:'caballos',icon:'🐴',label:'Caballos de Batalla',desc:'Alta venta · Bajo margen',color:T.warning,bg:`${T.warning}12`},
            {key:'puzzles',icon:'🧩',label:'Puzzles',desc:'Baja venta · Alto margen',color:T.info,bg:`${T.info}12`},
            {key:'perros',icon:'🐕',label:'Perros',desc:'Baja venta · Bajo margen',color:T.danger,bg:`${T.danger}12`},
          ].map(q=>(
            <div key={q.key} style={{background:q.bg,border:`1px solid ${q.color}30`,borderRadius:R,padding:18}}>
              <div style={{fontSize:24,marginBottom:6}}>{q.icon}</div>
              <div style={{color:q.color,fontFamily:theme.font,fontSize:17,fontWeight:700,marginBottom:2}}>{q.label}</div>
              <div style={{color:T.textSecondary,fontSize:11,fontFamily:theme.fontBody,marginBottom:12}}>{q.desc}</div>
              {matrix[q.key].length === 0
                ? <span style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>Sin platillos en este cuadrante</span>
                : matrix[q.key].map(d=><div key={d} style={{background:q.color+'20',color:q.color,padding:'4px 10px',borderRadius:100,fontSize:12,fontWeight:600,display:'inline-block',marginRight:4,marginBottom:4,fontFamily:theme.fontBody}}>{d}</div>)
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: INVENTARIO
// ════════════════════════════════════════════════════════════════════════════════
function ModuleInventario({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({product:'Camarones Tiger',stock:'',reason:''});
  const [inventory, setInventory] = useState([
    {id:1,name:'Camarones Tiger',cat:'Proteínas',stock:2.5,unit:'kg',expiry:'2026-05-27',status:'critical',unitCost:385},
    {id:2,name:'Res Premium',cat:'Proteínas',stock:12,unit:'kg',expiry:'2026-05-29',status:'ok',unitCost:280},
    {id:3,name:'Aceite de Oliva',cat:'Aceites',stock:3,unit:'L',expiry:'2026-08-15',status:'low',unitCost:145},
    {id:4,name:'Vino Tinto Reserva',cat:'Bebidas',stock:8,unit:'btl',expiry:'2028-01-01',status:'ok',unitCost:320},
    {id:5,name:'Salmón Fresco',cat:'Proteínas',stock:1.5,unit:'kg',expiry:'2026-05-26',status:'critical',unitCost:420},
    {id:6,name:'Queso Manchego',cat:'Lácteos',stock:4,unit:'kg',expiry:'2026-06-10',status:'ok',unitCost:185},
    {id:7,name:'Harina de Trigo',cat:'Secos',stock:25,unit:'kg',expiry:'2026-09-01',status:'ok',unitCost:45},
    {id:8,name:'Jitomates',cat:'Verduras',stock:8,unit:'kg',expiry:'2026-05-28',status:'low',unitCost:35},
    {id:9,name:'Limones',cat:'Verduras',stock:15,unit:'kg',expiry:'2026-05-30',status:'ok',unitCost:28},
    {id:10,name:'Mascarpone',cat:'Lácteos',stock:0.8,unit:'kg',expiry:'2026-05-26',status:'critical',unitCost:280},
  ]);
  const critical = inventory.filter(x=>x.status==='critical');
  const totalValue = inventory.reduce((a,x)=>a+x.stock*x.unitCost,0);
  const statusMap = {ok:{color:T.success,label:'OK',bg:`${T.success}12`},low:{color:T.warning,label:'Bajo',bg:`${T.warning}12`},critical:{color:T.danger,label:'Crítico',bg:`${T.danger}12`}};
  const daysToExpiry = expiry => {
    const ms = new Date(expiry) - new Date();
    return Math.floor(ms/(1000*60*60*24));
  };
  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:12}}>
        <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,margin:0}}>Inventario</h2>
        <Btn theme={theme} onClick={()=>setAdjustModal(true)}><RefreshCw size={14}/> Ajustar Inventario</Btn>
      </div>
      {critical.length>0 && (
        <div style={{background:`${T.danger}12`,border:`1px solid ${T.danger}30`,borderRadius:R,padding:14,marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <AlertCircle size={18} color={T.danger}/>
          <span style={{color:T.danger,fontFamily:theme.fontBody,fontSize:14}}>
            <strong>{critical.length} productos críticos:</strong> {critical.map(x=>x.name).join(', ')}
          </span>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
        {[{label:'Valor total',value:`$${Math.round(totalValue).toLocaleString()}`},{label:'Críticos',value:String(critical.length)},{label:'Por vencer',value:'2'}].map((s,i)=>(
          <Card key={i} theme={theme}><div style={{color:T.textSecondary,fontSize:12,marginBottom:6,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody}}>{s.label}</div><div style={{color:T.text,fontSize:26,fontFamily:theme.font,fontWeight:700}}>{s.value}</div></Card>
        ))}
      </div>
      <Card theme={theme} style={{padding:0,overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontFamily:theme.fontBody}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Producto','Categoría','Stock','Caducidad','Estado','Valor'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',color:T.textSecondary,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {inventory.map((item,i)=>{
              const days=daysToExpiry(item.expiry);
              const expiring=days<=3;
              return(
                <tr key={item.id} style={{borderBottom:i<inventory.length-1?`1px solid ${T.border}`:'none',background:expiring?`${T.warning}08`:'transparent'}}>
                  <td style={{padding:'13px 16px',color:T.text,fontWeight:500,fontSize:14}}>{item.name}</td>
                  <td style={{padding:'13px 16px',color:T.textSecondary,fontSize:13}}>{item.cat}</td>
                  <td style={{padding:'13px 16px',color:T.text,fontSize:14,fontWeight:600}}>{item.stock} {item.unit}</td>
                  <td style={{padding:'13px 16px',color:expiring?T.warning:T.textSecondary,fontSize:13,fontWeight:expiring?700:400}}>{item.expiry}{expiring?` (${days}d)`:''}</td>
                  <td style={{padding:'13px 16px'}}><Badge label={statusMap[item.status].label} color={statusMap[item.status].color} bg={statusMap[item.status].bg}/></td>
                  <td style={{padding:'13px 16px',color:T.text,fontSize:14}}>${(item.stock*item.unitCost).toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Modal open={adjustModal} onClose={()=>setAdjustModal(false)} title="Ajuste de Inventario" theme={theme} isMobile={isMobile}>
        <FormSelect label="Producto" value={adjustForm.product} onChange={v=>setAdjustForm(p=>({...p,product:v}))} options={inventory.map(x=>({value:x.name,label:x.name}))} theme={theme}/>
        <FormInput label="Nuevo stock" value={adjustForm.stock} onChange={v=>setAdjustForm(p=>({...p,stock:v}))} type="number" theme={theme}/>
        <FormInput label="Motivo" value={adjustForm.reason} onChange={v=>setAdjustForm(p=>({...p,reason:v}))} placeholder="Ej. Conteo físico, merma" theme={theme}/>
        <div style={{display:'flex',gap:10}}>
          <Btn theme={theme} variant="ghost" onClick={()=>setAdjustModal(false)} style={{flex:1}}>Cancelar</Btn>
          <Btn theme={theme} onClick={()=>{if(!adjustForm.stock)return;setInventory(p=>p.map(x=>x.name===adjustForm.product?{...x,stock:Number(adjustForm.stock)}:x));setAdjustModal(false);addToast('Inventario actualizado');}} style={{flex:1}}>Guardar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: WHATSAPP HUB
// ════════════════════════════════════════════════════════════════════════════════
function ModuleWhatsApp({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [tab, setTab] = useState('conversations');
  const [selectedConv, setSelectedConv] = useState(0);
  const [msgInput, setMsgInput] = useState('');
  const [autos, setAutos] = useState([
    {label:'Bienvenida automática',on:true},{label:'Respuesta fuera de horario',on:true},
    {label:'Confirmación de reserva',on:true},{label:'Encuesta post-visita',on:false},{label:'Recordatorio 24h antes',on:true},
  ]);
  const [messages, setMessages] = useState([
    {conv:0,role:'customer',text:'Hola! ¿Tienen mesa disponible para mañana sábado a las 8pm para 4 personas?',time:'14:32'},
    {conv:0,role:'restaurant',text:'¡Hola Ana! Claro que sí. Tenemos disponibilidad para mañana sábado a las 20h para 4 personas. ¿A qué nombre hacemos la reservación?',time:'14:33'},
    {conv:0,role:'customer',text:'A nombre de García, por favor',time:'14:35'},
    {conv:1,role:'customer',text:'Quiero hacer una reservación especial para aniversario, ¿tienen menú especial?',time:'14:18'},
    {conv:2,role:'customer',text:'¿Cuál es el especial del día?',time:'13:55'},
    {conv:2,role:'restaurant',text:'¡Hola! Hoy tenemos: Ceviche de atún con mango ($280) y Cordero a la leña ($450). ¿Te gustaría hacer una reservación?',time:'13:56'},
  ]);
  const convs = [
    {id:0,name:'Ana García',phone:'+52 55 1234 5678',preview:'A nombre de García, por favor',time:'14:35',unread:0},
    {id:1,name:'Carlos Rueda',phone:'+52 55 8765 4321',preview:'Quiero hacer una reservación especial...',time:'14:18',unread:1},
    {id:2,name:'María Santos',phone:'+52 55 2345 6789',preview:'¿Cuál es el especial del día?',time:'13:55',unread:0},
  ];
  const convMessages = messages.filter(m=>m.conv===selectedConv);
  const sendMsg = () => {
    if(!msgInput.trim())return;
    setMessages(p=>[...p,{conv:selectedConv,role:'restaurant',text:msgInput.trim(),time:new Date().toTimeString().slice(0,5)}]);
    setMsgInput('');
  };
  return (
    <div style={{animation:'fadeInUp 0.3s ease',height:'calc(100vh - 130px)',display:'flex',flexDirection:'column'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:16}}>WhatsApp Hub</h2>
      <div style={{display:'flex',gap:4,borderBottom:`1px solid ${T.border}`,marginBottom:16}}>
        {[['conversations','Conversaciones'],['automations','Automatizaciones'],['stats','Estadísticas']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 16px',background:'none',border:'none',borderBottom:`2px solid ${tab===k?T.accent:'transparent'}`,color:tab===k?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===k?600:400,transition:'all 0.2s'}}>{l}</button>
        ))}
      </div>
      {tab === 'conversations' && (
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'280px 1fr',gap:0,flex:1,minHeight:0,border:`1px solid ${T.border}`,borderRadius:R,overflow:'hidden'}}>
          <div style={{borderRight:`1px solid ${T.border}`,overflowY:'auto'}}>
            {convs.map(c=>(
              <div key={c.id} onClick={()=>setSelectedConv(c.id)} style={{padding:'14px 16px',cursor:'pointer',background:selectedConv===c.id?T.accentLight:'transparent',borderBottom:`1px solid ${T.border}`,display:'flex',gap:12,alignItems:'flex-start',transition:'background 0.15s'}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14,flexShrink:0}}>{c.name.split(' ').map(n=>n[0]).join('')}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <span style={{color:T.text,fontWeight:600,fontSize:14,fontFamily:theme.fontBody}}>{c.name}</span>
                    <span style={{color:T.textSecondary,fontSize:11}}>{c.time}</span>
                  </div>
                  <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.preview}</div>
                </div>
                {c.unread>0&&<div style={{background:T.success,color:'#fff',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{c.unread}</div>}
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',background:T.bg}}>
            <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
              {convMessages.map((m,i)=>(
                <div key={i} style={{display:'flex',justifyContent:m.role==='restaurant'?'flex-end':'flex-start'}}>
                  <div style={{maxWidth:'70%',background:m.role==='restaurant'?T.accent:T.bgCard,color:m.role==='restaurant'?'#fff':T.text,borderRadius:m.role==='restaurant'?`${R} ${R} 4px ${R}`:`4px ${R} ${R} ${R}`,padding:'10px 14px',border:m.role!=='restaurant'?`1px solid ${T.border}`:'none'}}>
                    <p style={{margin:0,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.5}}>{m.text}</p>
                    <div style={{color:m.role==='restaurant'?'rgba(255,255,255,0.6)':T.textSecondary,fontSize:11,marginTop:4,textAlign:'right'}}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:12,borderTop:`1px solid ${T.border}`,display:'flex',gap:8}}>
              <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="Escribe un mensaje..." style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:R,padding:'10px 14px',color:T.text,fontFamily:theme.fontBody,fontSize:14,outline:'none'}}/>
              <Btn theme={theme} onClick={sendMsg}><Send size={14}/></Btn>
            </div>
          </div>
        </div>
      )}
      {tab === 'automations' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {autos.map((a,i)=>(
            <Card key={i} theme={theme} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:T.text,fontFamily:theme.fontBody,fontSize:15}}>{a.label}</span>
              <div onClick={()=>{setAutos(p=>p.map((x,j)=>j===i?{...x,on:!x.on}:x));addToast(a.on?'Automatización desactivada':'Automatización activada',a.on?'error':'success');}} style={{width:48,height:26,borderRadius:100,background:a.on?T.accent:T.border,cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:3,left:a.on?24:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === 'stats' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14}}>
          {[{l:'Chats hoy',v:'47'},{l:'Resueltos por bot',v:'89%'},{l:'Escalados a humano',v:'5'},{l:'Tiempo respuesta avg',v:'2.3 min'}].map((s,i)=>(
            <Card key={i} theme={theme}><div style={{color:T.textSecondary,fontSize:12,marginBottom:6,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody}}>{s.l}</div><div style={{color:T.text,fontSize:26,fontFamily:theme.font,fontWeight:700}}>{s.v}</div></Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: REPUTACIÓN
// ════════════════════════════════════════════════════════════════════════════════
function ModuleReputacion({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [filter, setFilter] = useState('all');
  const [respondModal, setRespondModal] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [reviews, setReviews] = useState([
    {id:1,platform:'Google',stars:5,author:'Roberto Martínez',date:'hace 2 días',text:'Excelente experiencia, el pulpo a la brasa estaba perfectamente cocinado. El ambiente es increíble y el servicio muy atento. Definitivamente regresamos.',responded:true,response:'¡Gracias Roberto! Nos alegra mucho que hayas disfrutado tu visita. El pulpo a la brasa es uno de nuestros platillos más preciados. ¡Te esperamos pronto!'},
    {id:2,platform:'TripAdvisor',stars:2,author:'Sofía Chen',date:'hace 3 días',text:'La comida estaba bien pero la espera fue demasiado larga, más de 45 minutos para que nos atendieran. El servicio dejó mucho que desear en mesa.',responded:false,suggestedResponse:'Estimada Sofía, lamentamos mucho que tu experiencia no haya cumplido tus expectativas. Los tiempos de espera que describes no son aceptables para nuestros estándares. Hemos compartido tu comentario con el equipo para mejorar nuestro servicio. Te invitamos a darnos una segunda oportunidad — con gusto te ofrecemos un aperitivo de cortesía en tu próxima visita. Saludos, Equipo ESCA'},
    {id:3,platform:'Google',stars:5,author:'Alejandro Ruiz',date:'hace 4 días',text:'El mejor ceviche que he probado en CDMX, sin duda. El ambiente mediterráneo es muy cuidado y los precios son justos para la calidad.',responded:true,response:'¡Qué alegría, Alejandro! El ceviche mediterráneo es nuestro platillo bandera. ¡Te esperamos de vuelta!'},
    {id:4,platform:'Rappi',stars:3,author:'Laura Gómez',date:'hace 5 días',text:'La comida llegó bien, aunque el risotto estaba un poco frío para ser delivery. El empaque es muy bonito.',responded:false,suggestedResponse:'Hola Laura, gracias por tu comentario. Lamentamos que el risotto no llegara a la temperatura ideal — hemos ajustado nuestro proceso de empaque para delivery. ¡Esperamos que en tu próxima orden todo esté perfecto!'},
    {id:5,platform:'Google',stars:5,author:'Pablo Torres',date:'hace 6 días',text:'Primera vez que vengo y quedé muy sorprendido. La tabla de quesos es espectacular. Volveré pronto.',responded:false,suggestedResponse:'¡Bienvenido Pablo! Nos alegra mucho que hayas disfrutado tu primera visita. La tabla de quesos es una joya de nuestra carta. ¡Te esperamos pronto!'},
  ]);
  const platColors = {Google:'#4285F4',TripAdvisor:'#34A853',Rappi:'#FF5733'};
  const filtered = filter === 'all' ? reviews : filter === 'pending' ? reviews.filter(r=>!r.responded) : reviews.filter(r=>r.platform===filter);
  const openRespond = r => {setRespondModal(r);setResponseText(r.suggestedResponse||'');};
  const saveResponse = () => {
    setReviews(p=>p.map(r=>r.id===respondModal.id?{...r,responded:true,response:responseText}:r));
    setRespondModal(null);
    addToast('Respuesta publicada');
  };
  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>Reputación</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:24}}>
        {[{platform:'Google',stars:'4.7',reviews:847,color:'#4285F4'},{platform:'TripAdvisor',stars:'4.5',reviews:234,color:'#34A853'},{platform:'Rappi',stars:'4.8',reviews:1203,color:'#FF5733'}].map((p,i)=>(
          <Card key={i} theme={theme}>
            <div style={{color:p.color,fontFamily:theme.font,fontSize:17,fontWeight:700,marginBottom:4}}>{p.platform}</div>
            <div style={{color:T.text,fontSize:32,fontFamily:theme.font,fontWeight:700}}>{'★'.repeat(Math.floor(p.stars))} <span style={{fontSize:18}}>{p.stars}</span></div>
            <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody}}>{p.reviews.toLocaleString()} reseñas</div>
          </Card>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto'}}>
        {[['all','Todas'],['pending','Sin responder'],['Google','Google'],['TripAdvisor','TripAdvisor'],['Rappi','Rappi']].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?T.accent:'transparent',color:filter===k?'#fff':T.textSecondary,border:`1px solid ${filter===k?T.accent:T.border}`,borderRadius:100,padding:'6px 14px',cursor:'pointer',fontFamily:theme.fontBody,fontSize:13,whiteSpace:'nowrap',transition:'all 0.15s'}}>{l}</button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.map(r=>(
          <Card key={r.id} theme={theme}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                  <Badge label={r.platform} color={platColors[r.platform]} bg={`${platColors[r.platform]}18`}/>
                  <span style={{color:'#F59E0B',fontSize:14}}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                  <span style={{color:T.text,fontWeight:600,fontSize:14,fontFamily:theme.fontBody}}>{r.author}</span>
                  <span style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>{r.date}</span>
                </div>
                <p style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.6,margin:0,marginBottom:r.responded?8:0}}>{r.text}</p>
                {r.responded && <div style={{background:T.accentLight,borderLeft:`3px solid ${T.accent}`,padding:'8px 12px',borderRadius:'0 6px 6px 0',marginTop:8}}>
                  <div style={{color:T.textSecondary,fontSize:11,marginBottom:4,fontFamily:theme.fontBody}}>Tu respuesta:</div>
                  <p style={{color:T.text,fontSize:13,fontFamily:theme.fontBody,lineHeight:1.5,margin:0}}>{r.response}</p>
                </div>}
              </div>
              {!r.responded && <Btn theme={theme} small onClick={()=>openRespond(r)}>Responder</Btn>}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!respondModal} onClose={()=>setRespondModal(null)} title="Responder reseña" theme={theme} isMobile={isMobile} wide>
        {respondModal && <>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:R,padding:14,marginBottom:16}}>
            <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody,marginBottom:4}}>{respondModal.author} · {respondModal.date}</div>
            <p style={{color:T.text,fontSize:14,fontFamily:theme.fontBody,margin:0}}>{respondModal.text}</p>
          </div>
          <div style={{marginBottom:8}}>
            <label style={{color:T.textSecondary,fontSize:12,textTransform:'uppercase',letterSpacing:1,fontFamily:theme.fontBody,display:'block',marginBottom:6}}>Respuesta (sugerida por IA — puedes editar)</label>
            <textarea value={responseText} onChange={e=>setResponseText(e.target.value)} rows={6} style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,borderRadius:R,color:T.text,padding:'12px 14px',fontFamily:theme.fontBody,fontSize:14,resize:'vertical',outline:'none'}}/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn theme={theme} variant="ghost" onClick={()=>setRespondModal(null)} style={{flex:1}}>Cancelar</Btn>
            <Btn theme={theme} onClick={saveResponse} style={{flex:1}}>Publicar respuesta</Btn>
          </div>
        </>}
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: COPILOT IA
// ════════════════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Eres el asistente de inteligencia artificial de ESCA Restaurante, ubicado en Ciudad de México. Tienes acceso a los siguientes datos del restaurante:

DATOS OPERATIVOS HOY:
- Venta del día: $48,320 (vs $43,143 ayer, +12%)
- Ticket promedio: $387
- Pedidos: 125
- Margen estimado: 30%

INVENTARIO CRÍTICO:
- Camarones Tiger: 2.5 kg (mínimo: 5 kg) 🔴
- Salmón Fresco: 1.5 kg (mínimo: 4 kg) 🔴
- Aceite de Oliva: 3 L (mínimo: 4 L) 🔴

CLIENTES DESTACADOS:
- 847 clientes activos en CRM
- Ana Ramírez (Platinum) inactiva 52 días
- 3 clientes inactivos >45 días

PLATILLOS ESTRELLA:
- Ceviche Mediterráneo: 247 unidades (más alto volumen)
- Sangría de la Casa: 70% margen (más rentable en bebidas)
- Tiramisú Artesanal: 62% margen

CAMPAÑAS ACTIVAS: 2 (Martes Mágico 2x1, Nuevo Menú Primavera)
SUCURSALES: 3 (Centro ✅, Polanco ⚠️, Santa Fe 🚨)

Responde siempre en español. Sé conciso, directo y orientado a la acción. Cuando hagas recomendaciones, incluye pasos específicos. Puedes usar listas y formato markdown.`;

function ModuleCopilot({ theme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('restoos_api_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [configured, setConfigured] = useState(() => !!localStorage.getItem('restoos_api_key'));
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages, loading]);

  const suggestions = [
    '🛒 ¿Qué debo comprar hoy urgente?',
    '💰 ¿Cuál es mi platillo más rentable?',
    '📢 Genera una campaña para clientes inactivos',
    '📈 ¿Cómo mejorar mi ticket promedio?',
  ];

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg = { role: 'user', content };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: newMsgs.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Error al contactar el modelo'); }
      const data = await res.json();
      setMessages(p => [...p, { role: 'assistant', content: data.content[0].text }]);
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
      setMessages(p => [...p, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div style={{animation:'fadeInUp 0.3s ease',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40}}>
        <Bot size={48} color={T.accent} style={{marginBottom:16}}/>
        <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:8,textAlign:'center'}}>Copilot IA</h2>
        <p style={{color:T.textSecondary,fontFamily:theme.fontBody,fontSize:15,marginBottom:28,textAlign:'center',maxWidth:400,lineHeight:1.6}}>Para usar el Copilot IA necesitas una API Key de Anthropic. Se guardará localmente en tu navegador.</p>
        <Card theme={theme} style={{maxWidth:440,width:'100%'}}>
          <FormInput label="API Key de Anthropic" value={keyInput} onChange={setKeyInput} type="password" placeholder="sk-ant-..." theme={theme}/>
          <Btn theme={theme} style={{width:'100%'}} onClick={()=>{if(!keyInput)return;setApiKey(keyInput);localStorage.setItem('restoos_api_key',keyInput);setConfigured(true);addToast('Copilot activado 🤖');}}>Activar Copilot</Btn>
          <p style={{color:T.textSecondary,fontSize:11,fontFamily:theme.fontBody,textAlign:'center',marginTop:12}}>Tu API key se guarda localmente. Nunca se envía a nuestros servidores.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{animation:'fadeInUp 0.3s ease',display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Bot size={22} color={T.accent}/>
          <h2 style={{color:T.text,fontFamily:theme.font,fontSize:24,fontWeight:700,margin:0}}>Copilot ESCA</h2>
          <div style={{width:8,height:8,borderRadius:'50%',background:T.success}}/>
        </div>
        <button onClick={()=>{localStorage.removeItem('restoos_api_key');setConfigured(false);setApiKey('');setMessages([]);}} style={{background:'none',border:`1px solid ${T.border}`,color:T.textSecondary,borderRadius:R,padding:'4px 10px',cursor:'pointer',fontSize:12,fontFamily:theme.fontBody}}>Cambiar API Key</button>
      </div>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,paddingBottom:8}}>
        {messages.length === 0 && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:16}}>
            <Bot size={48} color={T.accentLight||'#E8F0EC'}/>
            <p style={{color:T.textSecondary,fontFamily:theme.fontBody,fontSize:15}}>¿En qué te puedo ayudar hoy?</p>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10,width:'100%',maxWidth:560}}>
              {suggestions.map(s=>(
                <button key={s} onClick={()=>send(s)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:R,padding:'12px 16px',cursor:'pointer',color:T.text,fontFamily:theme.fontBody,fontSize:14,textAlign:'left',transition:'border-color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'80%',background:m.role==='user'?T.accent:T.bgCard,color:m.role==='user'?'#fff':T.text,borderRadius:m.role==='user'?`${R} ${R} 4px ${R}`:`4px ${R} ${R} ${R}`,padding:'12px 16px',border:m.role!=='user'?`1px solid ${T.border}`:'none'}}>
              <p style={{margin:0,fontSize:14,fontFamily:theme.fontBody,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:`4px ${R} ${R} ${R}`,padding:'14px 18px',display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:T.accent,animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
              <span style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody,marginLeft:4}}>Copilot está pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{paddingTop:12,borderTop:`1px solid ${T.border}`,display:'flex',gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pregunta algo sobre tu restaurante..." style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:R,padding:'12px 16px',color:T.text,fontFamily:theme.fontBody,fontSize:14,outline:'none'}}/>
        <Btn theme={theme} onClick={()=>send()} disabled={loading||!input.trim()}><Send size={15}/></Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MODULE: MI MARCA
// ════════════════════════════════════════════════════════════════════════════════
function ModuleMarca({ theme, setTheme, addToast, isMobile }) {
  const T = theme.palette; const R = theme.borderRadius;
  const [tab, setTab] = useState('templates');
  const [localTheme, setLocalTheme] = useState({...theme, palette:{...theme.palette}});
  const [identity, setIdentity] = useState({name:'ESCA',tagline:'Experiencia Mediterránea',chef:'Carlos Morales',email:'hola@esca.mx',char:'E'});
  const LT = localTheme.palette;

  const fonts = [
    {name:'Cormorant Garamond',css:"'Cormorant Garamond', Georgia, serif"},
    {name:'Playfair Display',css:"'Playfair Display', Georgia, serif"},
    {name:'Syne',css:"'Syne', sans-serif"},
    {name:'DM Sans',css:"'DM Sans', sans-serif"},
    {name:'Abril Fatface',css:"'Abril Fatface', cursive"},
  ];
  const bodyFonts = [
    {name:'DM Sans',css:"'DM Sans', sans-serif"},
    {name:'Inter',css:"'Inter', sans-serif"},
    {name:'Nunito',css:"'Nunito', sans-serif"},
    {name:'Plus Jakarta Sans',css:"'Plus Jakarta Sans', sans-serif"},
  ];
  const palettes = [
    {name:'🌿 Mediterráneo Verde',accent:'#2B5F4A'},
    {name:'🌊 Azul Naval',accent:'#1B4F72'},
    {name:'🏺 Terracota',accent:'#A0522D'},
    {name:'💜 Púrpura Noche',accent:'#4A235A'},
    {name:'⬛ Negro Clásico',accent:'#1a1a1a'},
  ];
  const colorKeys = [
    ['bg','Fondo principal'],['bgCard','Fondo tarjetas'],['bgSidebar','Sidebar'],
    ['text','Texto principal'],['textSecondary','Texto secundario'],['accent','Color acento'],
    ['border','Borde'],['success','Éxito'],['warning','Advertencia'],['danger','Peligro'],
  ];

  return (
    <div style={{animation:'fadeInUp 0.3s ease'}}>
      <h2 style={{color:T.text,fontFamily:theme.font,fontSize:26,fontWeight:700,marginBottom:20}}>Mi Marca</h2>
      <div style={{display:'flex',gap:4,borderBottom:`1px solid ${T.border}`,marginBottom:24,overflowX:'auto'}}>
        {[['templates','Plantillas'],['identity','Identidad'],['colors','Colores'],['typography','Tipografía']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'10px 16px',background:'none',border:'none',borderBottom:`2px solid ${tab===k?T.accent:'transparent'}`,color:tab===k?T.accent:T.textSecondary,cursor:'pointer',fontFamily:theme.fontBody,fontSize:14,fontWeight:tab===k?600:400,whiteSpace:'nowrap',transition:'all 0.2s'}}>{l}</button>
        ))}
      </div>

      {tab === 'templates' && (
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:16}}>
          {Object.values(THEMES).map(t=>(
            <Card key={t.key} theme={theme} style={{cursor:'pointer',border:`2px solid ${theme.key===t.key?T.accent:T.border}`,transition:'all 0.2s'}}
              onClick={()=>{setTheme(t);setLocalTheme({...t,palette:{...t.palette}});addToast(`Tema "${t.name}" aplicado`);}}>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                {[t.palette.bg,t.palette.accent,t.palette.chartSecondary,t.palette.warning].map((c,i)=><div key={i} style={{width:24,height:24,borderRadius:'50%',background:c,border:'2px solid rgba(0,0,0,0.1)'}}/>)}
              </div>
              <div style={{fontFamily:t.font,fontSize:20,fontWeight:700,color:T.text,marginBottom:4}}>{t.name}</div>
              <div style={{fontFamily:t.fontBody,fontSize:12,color:T.textSecondary,marginBottom:12}}>{t.mode==='dark'?'🌙 Modo oscuro':'☀️ Modo claro'} · {t.borderRadius} radio</div>
              <Btn theme={theme} small variant={theme.key===t.key?'primary':'ghost'} style={{width:'100%',justifyContent:'center'}}>
                {theme.key===t.key?'✓ Aplicado':'Aplicar'}
              </Btn>
            </Card>
          ))}
        </div>
      )}

      {tab === 'identity' && (
        <Card theme={theme} style={{maxWidth:560}}>
          <FormInput label="Nombre del restaurante" value={identity.name} onChange={v=>setIdentity(p=>({...p,name:v}))} theme={theme}/>
          <FormInput label="Tagline" value={identity.tagline} onChange={v=>setIdentity(p=>({...p,tagline:v}))} theme={theme}/>
          <FormInput label="Chef Ejecutivo" value={identity.chef} onChange={v=>setIdentity(p=>({...p,chef:v}))} theme={theme}/>
          <FormInput label="Email de contacto" value={identity.email} onChange={v=>setIdentity(p=>({...p,email:v}))} type="email" theme={theme}/>
          <FormInput label="Carácter del logo (1 letra)" value={identity.char} onChange={v=>setIdentity(p=>({...p,char:v.slice(0,1).toUpperCase()}))} theme={theme}/>
          <div style={{display:'flex',alignItems:'center',gap:16,padding:16,background:T.bg,borderRadius:R,marginTop:4}}>
            <div style={{width:60,height:60,borderRadius:R,background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:theme.font,fontSize:28,fontWeight:700}}>{identity.char}</div>
            <div>
              <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:700}}>{identity.name}</div>
              <div style={{color:T.textSecondary,fontSize:13,fontFamily:theme.fontBody}}>{identity.tagline}</div>
            </div>
          </div>
          <Btn theme={theme} style={{marginTop:16,width:'100%',justifyContent:'center'}} onClick={()=>addToast('Identidad guardada')}>Guardar Identidad</Btn>
        </Card>
      )}

      {tab === 'colors' && (
        <div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
            {palettes.map(p=>(
              <button key={p.name} onClick={()=>setLocalTheme(prev=>({...prev,palette:{...prev.palette,accent:p.accent,accentLight:p.accent+'22',accentHover:p.accent,bgSidebar:p.accent,chartPrimary:p.accent}}))} style={{background:'transparent',border:`1px solid ${T.border}`,borderRadius:100,padding:'6px 14px',cursor:'pointer',color:T.text,fontFamily:theme.fontBody,fontSize:13,display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:p.accent}}/>
                {p.name}
              </button>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {colorKeys.map(([key,label])=>(
              <Card key={key} theme={theme} style={{display:'flex',alignItems:'center',gap:12,padding:14}}>
                <input type="color" value={LT[key]||'#000000'} onChange={e=>setLocalTheme(p=>({...p,palette:{...p.palette,[key]:e.target.value}}))} style={{width:36,height:36,border:`1px solid ${T.border}`,borderRadius:6,cursor:'pointer',background:'none',padding:2,flexShrink:0}}/>
                <div>
                  <div style={{color:T.text,fontSize:13,fontFamily:theme.fontBody,fontWeight:500}}>{label}</div>
                  <code style={{color:T.textSecondary,fontSize:11}}>{LT[key]||'#000000'}</code>
                </div>
              </Card>
            ))}
          </div>
          <div style={{position:'sticky',bottom:0,background:T.bg,paddingTop:12,marginTop:20}}>
            <Btn theme={theme} style={{width:'100%',justifyContent:'center'}} onClick={()=>{setTheme(localTheme);addToast('Colores aplicados en tiempo real');}}>Aplicar Cambios</Btn>
          </div>
        </div>
      )}

      {tab === 'typography' && (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Tipografía de Display</div>
            {fonts.map(f=>(
              <div key={f.name} onClick={()=>setLocalTheme(p=>({...p,font:f.css}))} style={{padding:14,borderRadius:R,border:`2px solid ${localTheme.font===f.css?T.accent:T.border}`,marginBottom:8,cursor:'pointer',transition:'border-color 0.15s'}}>
                <div style={{fontFamily:f.css,fontSize:22,color:T.text,marginBottom:4}}>La mejor experiencia culinaria</div>
                <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>{f.name}</div>
              </div>
            ))}
          </Card>
          <Card theme={theme}>
            <div style={{color:T.text,fontFamily:theme.font,fontSize:18,fontWeight:600,marginBottom:16}}>Tipografía del Cuerpo</div>
            {bodyFonts.map(f=>(
              <div key={f.name} onClick={()=>setLocalTheme(p=>({...p,fontBody:f.css}))} style={{padding:14,borderRadius:R,border:`2px solid ${localTheme.fontBody===f.css?T.accent:T.border}`,marginBottom:8,cursor:'pointer',transition:'border-color 0.15s'}}>
                <div style={{fontFamily:f.css,fontSize:15,color:T.text,marginBottom:4}}>El sabor que cuenta la historia del lugar</div>
                <div style={{color:T.textSecondary,fontSize:12,fontFamily:theme.fontBody}}>{f.name}</div>
              </div>
            ))}
          </Card>
          <div style={{position:'sticky',bottom:0,background:T.bg,paddingTop:8}}>
            <Btn theme={theme} style={{width:'100%',justifyContent:'center'}} onClick={()=>{setTheme(localTheme);addToast('Tipografía aplicada');}}>Aplicar Cambios</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ════════════════════════════════════════════════════════════════════════════════
export default function RestaurantOS({ onLogout }) {
  const [theme, setTheme] = useState(THEMES.esca);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [pendingOrders, setPendingOrders] = useState(2);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { toasts, addToast } = useToasts();

  useEffect(() => {
    injectStyles();
    const handle = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const T = theme.palette; const R = theme.borderRadius;
  const sidebarW = sidebarCollapsed ? 64 : 240;

  const navigate = (id) => {
    setActiveModule(id);
    if (isMobile) setMobileDrawerOpen(false);
  };

  const renderModule = () => {
    const props = { theme, addToast, isMobile };
    switch (activeModule) {
      case 'dashboard': return <ModuleDashboard {...props}/>;
      case 'crm': return <ModuleCRM {...props}/>;
      case 'menu': return <ModuleMenu {...props}/>;
      case 'compras': return <ModuleCompras {...props} onPendingChange={setPendingOrders}/>;
      case 'reporteo': return <ModuleReporteo {...props}/>;
      case 'ia-ops': return <ModuleIAOps {...props}/>;
      case 'inventario': return <ModuleInventario {...props}/>;
      case 'whatsapp': return <ModuleWhatsApp {...props}/>;
      case 'reputacion': return <ModuleReputacion {...props}/>;
      case 'copilot': return <ModuleCopilot {...props}/>;
      case 'marca': return <ModuleMarca {...props} setTheme={setTheme}/>;
      default: return <ModuleDashboard {...props}/>;
    }
  };

  const NavItem = ({ item, collapsed }) => {
    const active = activeModule === item.id;
    return (
      <button onClick={() => navigate(item.id)} title={item.label} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '12px 0' : '11px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: 'none', borderLeft: `3px solid ${active ? 'rgba(255,255,255,0.9)' : 'transparent'}`,
        color: active ? '#fff' : 'rgba(255,255,255,0.65)',
        cursor: 'pointer', fontSize: 14, fontFamily: theme.fontBody, fontWeight: active ? 600 : 400,
        transition: 'all 0.15s', position: 'relative',
      }}>
        <item.Icon size={18} strokeWidth={active ? 2.5 : 1.8}/>
        {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
        {item.id === 'compras' && pendingOrders > 0 && (
          <span style={{ background: T.danger, color: '#fff', borderRadius: 100, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{pendingOrders}</span>
        )}
      </button>
    );
  };

  const SidebarContent = ({ collapsed = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: collapsed ? '18px 0' : '20px 16px', borderBottom: 'rgba(255,255,255,0.1) 1px solid', textAlign: collapsed ? 'center' : 'left' }}>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: theme.font, fontWeight: 700, fontSize: 20, marginBottom: collapsed ? 0 : 8, margin: collapsed ? '0 auto' : undefined }}>E</div>
        {!collapsed && <>
          <div style={{ color: '#fff', fontFamily: theme.font, fontSize: 18, fontWeight: 700 }}>ESCA</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Experiencia Mediterránea</div>
        </>}
      </div>
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV.map(item => <NavItem key={item.id} item={item} collapsed={collapsed}/>)}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: collapsed ? '12px 0' : '14px 16px' }}>
        {!collapsed && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: theme.fontBody, marginBottom: 10 }}>Ana García<br/><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Dueño · ESCA</span></div>}
        <button onClick={onLogout} title="Cerrar sesión" style={{ width: collapsed ? 40 : '100%', height: 34, background: 'rgba(192,57,43,0.2)', border: 'none', borderRadius: 6, color: '#ff8a80', cursor: 'pointer', fontSize: 12, fontFamily: theme.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: collapsed ? '0 auto' : undefined }}>
          {collapsed ? '⎋' : <><span>⎋</span> Cerrar sesión</>}
        </button>
        {!isMobile && <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ marginTop: 6, width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '5px', cursor: 'pointer', fontSize: 12, fontFamily: theme.fontBody }}>
          {sidebarCollapsed ? '→ Expandir' : '← Colapsar'}
        </button>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: theme.fontBody, color: T.text, overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{ width: sidebarW, background: T.bgSidebar, flexShrink: 0, transition: 'width 0.25s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <SidebarContent collapsed={sidebarCollapsed}/>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && mobileDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} onClick={() => setMobileDrawerOpen(false)}/>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: T.bgSidebar, animation: 'drawerIn 0.25s ease', display: 'flex', flexDirection: 'column' }}>
            <SidebarContent collapsed={false}/>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 60, background: T.bgCard, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
          {isMobile && <button onClick={() => setMobileDrawerOpen(true)} style={{ background: 'none', border: 'none', color: T.text, cursor: 'pointer', padding: 4, display: 'flex' }}><Menu size={22}/></button>}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: theme.font, fontSize: 18, fontWeight: 700 }}>E</div>
            {!isMobile && <span style={{ color: T.text, fontFamily: theme.font, fontSize: 20, fontWeight: 700 }}>ESCA</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <button onClick={() => setThemeMenuOpen(!themeMenuOpen)} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: R, color: T.textSecondary, cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: theme.fontBody }}>
              <Palette size={14}/> {!isMobile && theme.name}
            </button>
            {themeMenuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: R, padding: 8, zIndex: 200, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                {Object.values(THEMES).map(t => (
                  <button key={t.key} onClick={() => { setTheme(t); setThemeMenuOpen(false); addToast(`Tema: ${t.name}`); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: theme.key === t.key ? T.accentLight : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', color: T.text, fontSize: 13, fontFamily: theme.fontBody, textAlign: 'left' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.palette.accent }}/> {t.name} {theme.key === t.key ? '✓' : ''}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => addToast('Sin notificaciones nuevas','info')} style={{ background: 'none', border: 'none', color: T.textSecondary, cursor: 'pointer', padding: 4, display: 'flex' }}><Bell size={18}/></button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>AG</div>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 24, paddingBottom: isMobile ? 'calc(68px + env(safe-area-inset-bottom))' : 24 }}>
          {renderModule()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: T.bgCard, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 150, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {BOTTOM_NAV.map(id => {
            const item = NAV.find(n => n.id === id);
            if (!item) return null;
            const active = activeModule === id;
            return (
              <button key={id} onClick={() => navigate(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', color: active ? T.accent : T.textSecondary, cursor: 'pointer', position: 'relative' }}>
                <item.Icon size={20} strokeWidth={active ? 2.5 : 1.8}/>
                <span style={{ fontSize: 10, fontFamily: theme.fontBody, fontWeight: active ? 700 : 400 }}>{item.label.split(' ')[0]}</span>
                {item.id === 'compras' && pendingOrders > 0 && <div style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)', background: T.danger, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingOrders}</div>}
              </button>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} theme={theme}/>
    </div>
  );
}
