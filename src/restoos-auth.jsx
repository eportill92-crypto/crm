import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const COLORS = {
  bgDark: '#0C0E14',
  bgMedium: '#14161E',
  bgLight: '#1C2030',
  bgCard: '#1E2235',
  green: '#2B5F4A',
  greenHover: '#1e4535',
  greenLight: '#E8F0EC',
  text: '#F0F1F5',
  textMuted: '#8B8FA8',
  border: '#2A2D3E',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#EF5350',
  purple: '#7C3AED',
  blue: '#2980B9',
  gold: '#D4891A',
};

// ─────────────────────────────────────────────
// CREDENTIALS
// ─────────────────────────────────────────────
const USERS = [
  { email: 'superadmin@restoos.app', password: 'RestooS2026!', role: 'superadmin', name: 'Carlos Méndez' },
  { email: 'owner@esca.mx', password: 'Demo2026!', role: 'owner', name: 'Ana García', restaurant: 'ESCA', accent: '#2B5F4A' },
  { email: 'gerente@esca.mx', password: 'Demo2026!', role: 'manager', name: 'Luis Torres', restaurant: 'ESCA', accent: '#2B5F4A' },
  { email: 'staff@esca.mx', password: 'Demo2026!', role: 'staff', name: 'María López', restaurant: 'ESCA', accent: '#2B5F4A' },
];

// ─────────────────────────────────────────────
// KEYFRAME ANIMATIONS
// ─────────────────────────────────────────────
const KEYFRAMES = `
@keyframes float1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-30px)} 66%{transform:translate(-10px,20px)} }
@keyframes float2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-25px,15px)} 66%{transform:translate(15px,-20px)} }
@keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(10px,25px)} 66%{transform:translate(-20px,-15px)} }
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes slideInRight { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
@keyframes toastOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
`;

// ─────────────────────────────────────────────
// MODULE METADATA
// ─────────────────────────────────────────────
const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Métricas y KPIs en tiempo real' },
  { id: 'crm', label: 'CRM & Lealtad', icon: '❤️', desc: 'Clientes, puntos y campañas' },
  { id: 'menu', label: 'Menú & QR', icon: '🍽️', desc: 'Carta digital interactiva' },
  { id: 'compras', label: 'Compras', icon: '🛒', desc: 'Órdenes y proveedores' },
  { id: 'reporteo', label: 'Reporteo', icon: '📈', desc: 'Informes avanzados' },
  { id: 'ia-ops', label: 'IA Operativa', icon: '🤖', desc: 'Automatización inteligente' },
  { id: 'inventario', label: 'Inventario', icon: '📦', desc: 'Stock y alertas de insumos' },
  { id: 'whatsapp', label: 'WhatsApp Hub', icon: '💬', desc: 'Comunicación y notificaciones' },
  { id: 'reputacion', label: 'Reputación', icon: '⭐', desc: 'Reseñas y opiniones online' },
  { id: 'copilot', label: 'Copilot IA', icon: '✨', desc: 'Asistente inteligente integrado' },
  { id: 'marca', label: 'Mi Marca', icon: '🎨', desc: 'Identidad y personalización' },
];

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────
const RESTAURANTS_INITIAL = [
  { id: 1, name: 'ESCA', city: 'CDMX', country: 'México', package: 'Pro', status: 'active', accent: '#2B5F4A', modules: ['dashboard','crm','menu','compras','reporteo','inventario','whatsapp','copilot'] },
  { id: 2, name: 'Noir Bistró', city: 'Monterrey', country: 'México', package: 'Starter', status: 'active', accent: '#1a1a2e', modules: ['dashboard','menu','inventario'] },
  { id: 3, name: 'La Palapa', city: 'Cancún', country: 'México', package: 'Enterprise', status: 'active', accent: '#2d5016', modules: ['dashboard','crm','menu','compras','reporteo','ia-ops','inventario','whatsapp','reputacion','copilot','marca'] },
  { id: 4, name: 'El Fogón', city: 'Guadalajara', country: 'México', package: 'Starter', status: 'suspended', accent: '#8B4513', modules: ['dashboard','menu'] },
  { id: 5, name: 'Mar y Tierra', city: 'Miami', country: 'USA', package: 'Pro', status: 'trial', accent: '#1B4F72', modules: ['dashboard','crm','menu','compras','reporteo','copilot'] },
];

const USERS_INITIAL = [
  { id: 1, name: 'Carlos Méndez', email: 'superadmin@restoos.app', role: 'superadmin', restaurant: '—', status: 'active', lastSeen: 'Ahora' },
  { id: 2, name: 'Ana García', email: 'owner@esca.mx', role: 'owner', restaurant: 'ESCA', status: 'active', lastSeen: 'hace 2h' },
  { id: 3, name: 'Luis Torres', email: 'gerente@esca.mx', role: 'manager', restaurant: 'ESCA', status: 'active', lastSeen: 'hace 1d' },
  { id: 4, name: 'María López', email: 'staff@esca.mx', role: 'staff', restaurant: 'ESCA', status: 'active', lastSeen: 'hace 3h' },
  { id: 5, name: 'Roberto Sánchez', email: 'owner@noir.mx', role: 'owner', restaurant: 'Noir Bistró', status: 'active', lastSeen: 'hace 2d' },
  { id: 6, name: 'Patricia Ruiz', email: 'owner@palapa.mx', role: 'owner', restaurant: 'La Palapa', status: 'active', lastSeen: 'hace 5h' },
];

const ACTIVITY_LOG = [
  { id: 1, action: "Restaurante 'Café Morelia' creado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-25 14:32' },
  { id: 2, action: 'Login exitoso', user: 'Ana García', ip: '201.165.87.54', date: '2026-05-25 14:15' },
  { id: 3, action: "Usuario staff@noir.mx activado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-25 12:08' },
  { id: 4, action: "Paquete Pro actualizado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-25 11:22' },
  { id: 5, action: "Restaurante 'El Fogón' suspendido", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-24 18:45' },
  { id: 6, action: "Usuario nuevo: owner@tierra.mx", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-24 15:30' },
  { id: 7, action: 'Login exitoso', user: 'Patricia Ruiz', ip: '198.200.14.88', date: '2026-05-24 13:10' },
  { id: 8, action: "Módulo WhatsApp Hub habilitado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-24 10:05' },
  { id: 9, action: 'Login exitoso', user: 'Luis Torres', ip: '201.165.22.11', date: '2026-05-23 20:44' },
  { id: 10, action: "Restaurante 'Mar y Tierra' en trial", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-23 16:18' },
  { id: 11, action: "Usuario owner@noir.mx editado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-23 11:02' },
  { id: 12, action: 'Login exitoso', user: 'Roberto Sánchez', ip: '177.230.55.99', date: '2026-05-23 09:34' },
  { id: 13, action: "Paquete Starter creado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-22 17:55' },
  { id: 14, action: "Restaurante 'Noir Bistró' creado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-22 14:20' },
  { id: 15, action: "Restaurante 'La Palapa' creado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-21 10:00' },
  { id: 16, action: "Módulo IA Operativa habilitado", user: 'Carlos Méndez', ip: '187.152.43.21', date: '2026-05-21 09:45' },
];

const PACKAGES_INITIAL = [
  {
    id: 1,
    name: 'Starter',
    price: 1490,
    users: 3,
    branches: 1,
    modules: ['Dashboard', 'Menú & QR', 'Inventario'],
    support: 'Email',
    highlight: false,
  },
  {
    id: 2,
    name: 'Pro',
    price: 3490,
    users: 10,
    branches: 3,
    modules: ['Dashboard', 'CRM & Lealtad', 'Menú & QR', 'Compras', 'Reporteo', 'Inventario', 'WhatsApp Hub', 'Copilot IA'],
    support: 'Chat prioritario',
    highlight: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 7990,
    users: null,
    branches: null,
    modules: ['Todos los módulos', 'IA Operativa', 'Reputación', 'Mi Marca'],
    support: 'Gerente dedicado',
    highlight: false,
  },
];

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────
const inputStyle = {
  background: COLORS.bgLight,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  color: COLORS.text,
  padding: '12px 12px 12px 40px',
  width: '100%',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 15,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const inputNoIconStyle = {
  ...inputStyle,
  padding: '12px',
};

function StatusBadge({ status }) {
  const map = {
    active: { label: 'Activo', color: COLORS.success, bg: 'rgba(76,175,80,0.15)' },
    suspended: { label: 'Suspendido', color: COLORS.danger, bg: 'rgba(239,83,80,0.15)' },
    trial: { label: 'Trial', color: COLORS.warning, bg: 'rgba(255,152,0,0.15)' },
    inactive: { label: 'Inactivo', color: COLORS.textMuted, bg: 'rgba(139,143,168,0.15)' },
  };
  const s = map[status] || map.inactive;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      fontFamily: 'DM Sans, sans-serif',
    }}>{s.label}</span>
  );
}

function RoleBadge({ role }) {
  const map = {
    superadmin: { label: 'Super Admin', color: COLORS.purple, bg: 'rgba(124,58,237,0.15)' },
    owner: { label: 'Dueño', color: COLORS.green, bg: 'rgba(43,95,74,0.15)' },
    manager: { label: 'Gerente', color: COLORS.blue, bg: 'rgba(41,128,185,0.15)' },
    staff: { label: 'Staff', color: COLORS.textMuted, bg: 'rgba(139,143,168,0.15)' },
  };
  const s = map[role] || map.staff;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      fontFamily: 'DM Sans, sans-serif',
    }}>{s.label}</span>
  );
}

function ModalBackdrop({ onClose, children, isMobile }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: COLORS.bgCard,
        borderRadius: isMobile ? '20px 20px 0 0' : 12,
        width: isMobile ? '100%' : 520,
        maxWidth: '100%',
        maxHeight: isMobile ? '90vh' : '85vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
        animation: 'fadeInUp 0.25s ease',
        border: `1px solid ${COLORS.border}`,
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 24px 0',
    }}>
      <h3 style={{ margin: 0, color: COLORS.text, fontFamily: 'Syne, sans-serif', fontSize: 18 }}>{title}</h3>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', color: COLORS.textMuted,
          cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1,
        }}
      >×</button>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: COLORS.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...inputNoIconStyle,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238B8FA8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 36,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: COLORS.bgCard }}>{o.label}</option>
      ))}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputNoIconStyle}
    />
  );
}

// ─────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 10,
            background: COLORS.bgCard,
            border: `1px solid ${t.type === 'success' ? COLORS.success : t.type === 'error' ? COLORS.danger : COLORS.border}`,
            borderLeft: `4px solid ${t.type === 'success' ? COLORS.success : t.type === 'error' ? COLORS.danger : COLORS.blue}`,
            borderRadius: 8,
            padding: '12px 16px',
            minWidth: 280, maxWidth: 360,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideInRight 0.3s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span style={{ flex: 1, color: COLORS.text, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────
// COMPONENT 1: LoginPage
// ─────────────────────────────────────────────
function LoginPage({ onLogin, isMobile }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document.getElementById('restoos-auth-styles')) {
      const s = document.createElement('style');
      s.id = 'restoos-auth-styles';
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
    }
  }, []);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(false);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      setLoading(false);
      if (user) {
        onLogin(user);
      } else {
        setError(true);
      }
    }, 600);
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(false);
    setTimeout(() => {
      const user = USERS.find(u => u.email === demoEmail && u.password === demoPass);
      if (user) onLogin(user);
    }, 300);
  };

  const demoButtons = [
    { label: '👑 Super Admin', email: 'superadmin@restoos.app', pass: 'RestooS2026!', color: COLORS.purple, bg: 'rgba(124,58,237,0.15)' },
    { label: '🏪 Dueño', email: 'owner@esca.mx', pass: 'Demo2026!', color: COLORS.green, bg: 'rgba(43,95,74,0.15)' },
    { label: '📊 Gerente', email: 'gerente@esca.mx', pass: 'Demo2026!', color: COLORS.blue, bg: 'rgba(41,128,185,0.15)' },
    { label: '👤 Staff', email: 'staff@esca.mx', pass: 'Demo2026!', color: COLORS.textMuted, bg: 'rgba(139,143,168,0.15)' },
  ];

  const leftPanel = (
    <div style={{
      width: isMobile ? '100%' : '45%',
      minHeight: isMobile ? 'auto' : '100vh',
      background: COLORS.bgDark,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: isMobile ? '32px 24px 24px' : '60px 48px',
      boxSizing: 'border-box',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}>
      {/* Blobs */}
      {!isMobile && <>
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(43,95,74,0.4), transparent)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'float1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '60%',
          width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(41,128,185,0.3), transparent)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'float2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '70%', left: '10%',
          width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'float3 12s ease-in-out infinite',
        }} />
      </>}

      {/* Brand */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: isMobile ? 32 : 48,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>RestoOS</div>
        <div style={{ color: COLORS.textMuted, fontSize: isMobile ? 14 : 16, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
          La plataforma que tu restaurante merece
        </div>

        {/* Feature pills */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 48 }}>
            {['✦ 11 módulos integrados', '✦ IA Copilot incluido', '✦ Multi-sucursal en tiempo real'].map((pill, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: COLORS.text, fontSize: 14, fontFamily: 'DM Sans, sans-serif',
                animation: `fadeInUp 0.5s ease ${0.1 * i + 0.3}s both`,
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(43,95,74,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: COLORS.green,
                }}>{pill.split(' ')[0]}</span>
                <span>{pill.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isMobile && (
        <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', position: 'relative', zIndex: 1 }}>
          © 2026 RestoOS · Todos los derechos reservados
        </div>
      )}
    </div>
  );

  const rightPanel = (
    <div style={{
      width: isMobile ? '100%' : '55%',
      minHeight: isMobile ? 'auto' : '100vh',
      background: COLORS.bgMedium,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '32px 24px 48px' : '60px 48px',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.4s ease' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700,
          color: COLORS.text, margin: '0 0 8px',
        }}>Bienvenido de nuevo</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 15, fontFamily: 'DM Sans, sans-serif', margin: '0 0 32px' }}>
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: COLORS.textMuted, fontSize: 16, pointerEvents: 'none',
            }}>✉</span>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(false); }}
              placeholder="correo@ejemplo.com"
              style={{
                ...inputStyle,
                borderColor: error ? COLORS.danger : COLORS.border,
              }}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: COLORS.textMuted, fontSize: 16, pointerEvents: 'none',
            }}>🔒</span>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              placeholder="Contraseña"
              style={{
                ...inputStyle,
                paddingRight: 80,
                borderColor: error ? COLORS.danger : COLORS.border,
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: COLORS.textMuted,
                cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                padding: '4px 6px', borderRadius: 4,
              }}
            >
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,83,80,0.1)', border: `1px solid ${COLORS.danger}`,
              borderRadius: 8, padding: '10px 14px',
              color: COLORS.danger, fontSize: 13, fontFamily: 'DM Sans, sans-serif',
              animation: 'slideDown 0.2s ease',
            }}>
              Credenciales incorrectas. Verifica tu email y contraseña.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? COLORS.greenHover : COLORS.green,
              color: COLORS.text, border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = COLORS.greenHover; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = COLORS.green; }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '28px 0 20px', color: COLORS.textMuted,
          fontSize: 12, fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{ flex: 1, height: 1, background: COLORS.border }} />
          <span>Acceso rápido demo</span>
          <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {demoButtons.map((d, i) => (
            <button
              key={i}
              onClick={() => fillDemo(d.email, d.pass)}
              style={{
                padding: '10px 12px',
                background: d.bg,
                border: `1px solid ${d.color}33`,
                borderRadius: 8,
                color: d.color,
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                textAlign: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      background: COLORS.bgDark,
    }}>
      {leftPanel}
      {rightPanel}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT 2: SuperAdminPanel
// ─────────────────────────────────────────────
function SuperAdminPanel({ onLogout, isMobile }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();

  // Restaurants state
  const [restaurants, setRestaurants] = useState(RESTAURANTS_INITIAL);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [deleteRestaurant, setDeleteRestaurant] = useState(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  // Users state
  const [users, setUsers] = useState(USERS_INITIAL);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Packages state
  const [packages, setPackages] = useState(PACKAGES_INITIAL);
  const [editPackage, setEditPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'restaurants', icon: '🏪', label: 'Restaurantes' },
    { id: 'users', icon: '👥', label: 'Usuarios' },
    { id: 'packages', icon: '💎', label: 'Paquetes' },
    { id: 'activity', icon: '📋', label: 'Actividad' },
  ];

  const SIDEBAR_W = sidebarCollapsed ? 64 : 240;

  const sidebar = (
    <div style={{
      width: isMobile ? 260 : SIDEBAR_W,
      minHeight: '100vh',
      background: COLORS.bgDark,
      borderRight: `1px solid ${COLORS.border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s',
      overflow: 'hidden',
      flexShrink: 0,
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '24px 0' : '24px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        gap: 10,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 18,
          flexShrink: 0,
        }}>R</div>
        {!sidebarCollapsed && (
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: COLORS.text, fontSize: 18 }}>
            RestoOS
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (isMobile) setMobileDrawerOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center',
                gap: sidebarCollapsed ? 0 : 10,
                padding: sidebarCollapsed ? '10px 0' : '10px 12px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(43,95,74,0.2)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: active ? COLORS.green : COLORS.textMuted,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.15s',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = COLORS.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted; } }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info + collapse */}
      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '16px 8px' }}>
        {!sidebarCollapsed && (
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ color: COLORS.text, fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Carlos Méndez</div>
            <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>Super Admin</div>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: 8, width: '100%', padding: '8px 12px',
            background: 'none', border: 'none', borderRadius: 8,
            color: COLORS.danger, cursor: 'pointer', fontSize: 13,
            fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,83,80,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span>🚪</span>
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: 8, width: '100%', padding: '8px 12px', marginTop: 4,
              background: 'none', border: 'none', borderRadius: 8,
              color: COLORS.textMuted, cursor: 'pointer', fontSize: 12,
              fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span>{sidebarCollapsed ? '→' : '←'}</span>
            {!sidebarCollapsed && <span>Contraer</span>}
          </button>
        )}
      </div>
    </div>
  );

  // ── Tab: Overview ──
  const kpiCards = [
    { icon: '🏪', label: 'Restaurantes activos', value: restaurants.filter(r => r.status === 'active').length, sub: '+2 este mes', subColor: COLORS.success },
    { icon: '👥', label: 'Usuarios totales', value: users.length, sub: '+5 este mes', subColor: COLORS.success },
    { icon: '⏱', label: 'En trial', value: restaurants.filter(r => r.status === 'trial').length, sub: 'Expiran pronto', subColor: COLORS.warning },
    { icon: '💰', label: 'MRR Estimado', value: '$42,580', sub: '+18% vs mes anterior', subColor: COLORS.success },
  ];

  const overviewTab = (
    <div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 22, margin: '0 0 24px' }}>Overview del Sistema</h2>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {kpiCards.map((k, i) => (
          <div key={i} style={{
            background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: '20px', animation: `fadeInUp 0.3s ease ${i * 0.07}s both`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ color: COLORS.text, fontSize: isMobile ? 24 : 32, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 4 }}>{k.value}</div>
            <div style={{ color: k.subColor, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '20px' }}>
        <h3 style={{ color: COLORS.text, fontFamily: 'Syne, sans-serif', fontSize: 16, margin: '0 0 16px' }}>Actividad Reciente</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ACTIVITY_LOG.slice(0, 5).map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < 4 ? `1px solid ${COLORS.border}` : 'none',
              flexWrap: 'wrap', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.green, flexShrink: 0 }} />
                <span style={{ color: COLORS.text, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{a.action}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{a.user}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{a.date.split(' ')[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab: Restaurants ──
  const openNewRestaurant = () => {
    setEditRestaurant({ id: null, name: '', city: '', country: 'México', package: 'Starter', status: 'active', accent: '#2B5F4A', modules: ['dashboard'] });
    setShowRestaurantModal(true);
  };
  const openEditRestaurant = (r) => { setEditRestaurant({ ...r }); setShowRestaurantModal(true); };
  const toggleRestaurantStatus = (id) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = r.status === 'active' ? 'suspended' : 'active';
      return { ...r, status: next };
    }));
    const r = restaurants.find(r => r.id === id);
    addToast(`Restaurante '${r.name}' ${r.status === 'active' ? 'suspendido' : 'activado'}`, 'success');
  };
  const confirmDeleteRestaurant = () => {
    setRestaurants(prev => prev.filter(r => r.id !== deleteRestaurant.id));
    addToast(`Restaurante '${deleteRestaurant.name}' eliminado`, 'success');
    setDeleteRestaurant(null);
  };
  const saveRestaurant = (data) => {
    if (data.id) {
      setRestaurants(prev => prev.map(r => r.id === data.id ? data : r));
    } else {
      setRestaurants(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setShowRestaurantModal(false);
    addToast('Restaurante guardado exitosamente', 'success');
  };

  const restaurantsTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 22, margin: 0 }}>Restaurantes</h2>
        <button
          onClick={openNewRestaurant}
          style={{
            padding: '10px 18px', background: COLORS.green, color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
          }}
        >+ Nuevo Restaurante</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              {['Nombre', 'Ciudad', 'País', 'Paquete', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 14px', fontSize: 11,
                  color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
                  borderBottom: `1px solid ${COLORS.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px', fontFamily: 'DM Sans, sans-serif', color: COLORS.text, fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.accent, flexShrink: 0 }} />
                    {r.name}
                  </div>
                </td>
                <td style={{ padding: '14px', color: COLORS.textMuted, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{r.city}</td>
                <td style={{ padding: '14px', color: COLORS.textMuted, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{r.country}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    color: r.package === 'Enterprise' ? COLORS.gold : r.package === 'Pro' ? COLORS.green : COLORS.blue,
                    background: r.package === 'Enterprise' ? 'rgba(212,137,26,0.15)' : r.package === 'Pro' ? 'rgba(43,95,74,0.15)' : 'rgba(41,128,185,0.15)',
                  }}>{r.package}</span>
                </td>
                <td style={{ padding: '14px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditRestaurant(r)} style={{ background: 'rgba(41,128,185,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: COLORS.blue }}>✏️</button>
                    <button onClick={() => toggleRestaurantStatus(r.id)} style={{ background: r.status === 'active' ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: r.status === 'active' ? COLORS.warning : COLORS.success }}>🔄</button>
                    <button onClick={() => setDeleteRestaurant(r)} style={{ background: 'rgba(239,83,80,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: COLORS.danger }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Tab: Users ──
  const openNewUser = () => {
    setEditUser({ id: null, name: '', email: '', password: '', role: 'staff', restaurant: '—', status: 'active', lastSeen: 'Nunca' });
    setShowUserModal(true);
  };
  const openEditUser = (u) => { setEditUser({ ...u }); setShowUserModal(true); };
  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id !== id ? u : { ...u, status: u.status === 'active' ? 'inactive' : 'active' }));
    const u = users.find(u => u.id === id);
    addToast(`Usuario ${u.name} ${u.status === 'active' ? 'desactivado' : 'activado'}`, 'success');
  };
  const confirmDeleteUser = () => {
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    addToast(`Usuario '${deleteUser.name}' eliminado`, 'success');
    setDeleteUser(null);
  };
  const saveUser = (data) => {
    if (data.id) {
      setUsers(prev => prev.map(u => u.id === data.id ? { ...data } : u));
    } else {
      setUsers(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setShowUserModal(false);
    addToast('Usuario guardado exitosamente', 'success');
  };

  const usersTab = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 22, margin: 0 }}>Usuarios</h2>
        <button onClick={openNewUser} style={{ padding: '10px 18px', background: COLORS.green, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}>+ Nuevo Usuario</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              {['Nombre', 'Email', 'Rol', 'Restaurante', 'Estado', 'Último acceso', 'Acciones'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px', color: COLORS.text, fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '14px', color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{u.email}</td>
                <td style={{ padding: '14px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '14px', color: COLORS.textMuted, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{u.restaurant}</td>
                <td style={{ padding: '14px' }}><StatusBadge status={u.status} /></td>
                <td style={{ padding: '14px', color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{u.lastSeen}</td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditUser(u)} style={{ background: 'rgba(41,128,185,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: COLORS.blue }}>✏️</button>
                    <button onClick={() => toggleUserStatus(u.id)} style={{ background: u.status === 'active' ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: u.status === 'active' ? COLORS.warning : COLORS.success }}>🔄</button>
                    <button onClick={() => setDeleteUser(u)} style={{ background: 'rgba(239,83,80,0.15)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: COLORS.danger }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Tab: Packages ──
  const packagesTab = (
    <div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 22, margin: '0 0 24px' }}>Paquetes y Precios</h2>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
        {packages.map((pkg, i) => (
          <div key={pkg.id} style={{
            background: COLORS.bgCard,
            border: `2px solid ${pkg.highlight ? COLORS.green : COLORS.border}`,
            borderRadius: 16, padding: '28px 24px',
            position: 'relative',
            animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
          }}>
            {pkg.highlight && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: COLORS.green, color: '#fff', padding: '4px 16px',
                borderRadius: 20, fontSize: 11, fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
              }}>MÁS POPULAR</div>
            )}
            <div style={{ color: COLORS.text, fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{pkg.name}</div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ color: COLORS.text, fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800 }}>${pkg.price.toLocaleString()}</span>
              <span style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>/mes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                👥 Hasta {pkg.users ? `${pkg.users} usuarios` : 'usuarios ilimitados'}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                🏪 {pkg.branches ? `${pkg.branches} sucursal${pkg.branches > 1 ? 'es' : ''}` : 'Sucursales ilimitadas'}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                🎧 Support: {pkg.support}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              {pkg.modules.map((m, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', color: COLORS.text, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  <span style={{ color: COLORS.green }}>✓</span> {m}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setEditPackage({ ...pkg }); setShowPackageModal(true); }}
              style={{
                width: '100%', padding: '10px', background: 'transparent',
                border: `1px solid ${COLORS.border}`, borderRadius: 8,
                color: COLORS.textMuted, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = COLORS.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted; }}
            >✏️ Editar paquete</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Tab: Activity ──
  const activityTab = (
    <div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 22, margin: '0 0 24px' }}>Registro de Actividad</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr>
              {['Acción', 'Usuario', 'IP', 'Fecha/Hora'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITY_LOG.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px', color: COLORS.text, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{a.action}</td>
                <td style={{ padding: '12px 14px', color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{a.user}</td>
                <td style={{ padding: '12px 14px', color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{a.ip}</td>
                <td style={{ padding: '12px 14px', color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabContent = {
    overview: overviewTab,
    restaurants: restaurantsTab,
    users: usersTab,
    packages: packagesTab,
    activity: activityTab,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bgMedium, position: 'relative' }}>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: COLORS.bgDark, borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
        }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{ background: 'none', border: 'none', color: COLORS.text, fontSize: 22, cursor: 'pointer', padding: 4 }}
          >☰</button>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: COLORS.text, fontSize: 18 }}>RestoOS</span>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: COLORS.danger, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Salir</button>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {isMobile && mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
          transform: mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s',
        }}>
          {sidebar}
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && sidebar}

      {/* Main content */}
      <div style={{
        flex: 1,
        padding: isMobile ? '80px 16px 32px' : '40px 32px',
        overflowX: 'hidden',
        minWidth: 0,
      }}>
        {tabContent[activeTab]}
      </div>

      {/* ── MODALS ── */}

      {/* Restaurant Modal */}
      {showRestaurantModal && editRestaurant && (
        <RestaurantModal
          data={editRestaurant}
          isMobile={isMobile}
          onSave={saveRestaurant}
          onClose={() => setShowRestaurantModal(false)}
        />
      )}

      {/* Restaurant Delete Modal */}
      {deleteRestaurant && (
        <ModalBackdrop onClose={() => setDeleteRestaurant(null)} isMobile={isMobile}>
          <ModalHeader title="Confirmar eliminación" onClose={() => setDeleteRestaurant(null)} />
          <div style={{ padding: '20px 24px 24px' }}>
            <p style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6 }}>
              ¿Estás seguro de eliminar <strong style={{ color: COLORS.text }}>"{deleteRestaurant.name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteRestaurant(null)} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cancelar</button>
              <button onClick={confirmDeleteRestaurant} style={{ padding: '10px 20px', background: COLORS.danger, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}>Eliminar</button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* User Modal */}
      {showUserModal && editUser && (
        <UserModal
          data={editUser}
          isMobile={isMobile}
          restaurants={restaurants}
          onSave={saveUser}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {/* User Delete Modal */}
      {deleteUser && (
        <ModalBackdrop onClose={() => setDeleteUser(null)} isMobile={isMobile}>
          <ModalHeader title="Confirmar eliminación" onClose={() => setDeleteUser(null)} />
          <div style={{ padding: '20px 24px 24px' }}>
            <p style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6 }}>
              ¿Estás seguro de eliminar al usuario <strong style={{ color: COLORS.text }}>"{deleteUser.name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteUser(null)} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cancelar</button>
              <button onClick={confirmDeleteUser} style={{ padding: '10px 20px', background: COLORS.danger, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}>Eliminar</button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Package Modal */}
      {showPackageModal && editPackage && (
        <PackageModal
          data={editPackage}
          isMobile={isMobile}
          onSave={(data) => {
            setPackages(prev => prev.map(p => p.id === data.id ? data : p));
            setShowPackageModal(false);
            addToast('Paquete actualizado exitosamente', 'success');
          }}
          onClose={() => setShowPackageModal(false)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

// ─────────────────────────────────────────────
// RESTAURANT MODAL
// ─────────────────────────────────────────────
function RestaurantModal({ data, isMobile, onSave, onClose }) {
  const [form, setForm] = useState({ ...data });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleModule = (id) => {
    setForm(f => ({
      ...f,
      modules: f.modules.includes(id)
        ? f.modules.filter(m => m !== id)
        : [...f.modules, id],
    }));
  };

  return (
    <ModalBackdrop onClose={onClose} isMobile={isMobile}>
      <ModalHeader title={form.id ? 'Editar Restaurante' : 'Nuevo Restaurante'} onClose={onClose} />
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <FormField label="Nombre">
          <TextInput value={form.name} onChange={v => set('name', v)} placeholder="Nombre del restaurante" />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Ciudad">
            <TextInput value={form.city} onChange={v => set('city', v)} placeholder="Ciudad" />
          </FormField>
          <FormField label="País">
            <TextInput value={form.country} onChange={v => set('country', v)} placeholder="País" />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Paquete">
            <SelectInput
              value={form.package}
              onChange={v => set('package', v)}
              options={[{ value: 'Starter', label: 'Starter' }, { value: 'Pro', label: 'Pro' }, { value: 'Enterprise', label: 'Enterprise' }]}
            />
          </FormField>
          <FormField label="Estado">
            <SelectInput
              value={form.status}
              onChange={v => set('status', v)}
              options={[{ value: 'active', label: 'Activo' }, { value: 'suspended', label: 'Suspendido' }, { value: 'trial', label: 'Trial' }]}
            />
          </FormField>
        </div>
        <FormField label="Color acento">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={form.accent}
              onChange={e => set('accent', e.target.value)}
              style={{ width: 48, height: 40, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: 'none', cursor: 'pointer', padding: 2 }}
            />
            <span style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>{form.accent}</span>
          </div>
        </FormField>
        <FormField label="Módulos habilitados">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ALL_MODULES.map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: form.modules.includes(m.id) ? 'rgba(43,95,74,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.modules.includes(m.id) ? COLORS.green + '44' : COLORS.border}`, transition: 'all 0.15s' }}>
                <input
                  type="checkbox"
                  checked={form.modules.includes(m.id)}
                  onChange={() => toggleModule(m.id)}
                  style={{ accentColor: COLORS.green, width: 14, height: 14 }}
                />
                <span style={{ color: COLORS.text, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{m.icon} {m.label}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cancelar</button>
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            style={{ padding: '10px 24px', background: COLORS.green, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}
          >Guardar</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─────────────────────────────────────────────
// USER MODAL
// ─────────────────────────────────────────────
function UserModal({ data, isMobile, restaurants, onSave, onClose }) {
  const [form, setForm] = useState({ ...data });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const isNew = !form.id;

  const restaurantOptions = [
    { value: '—', label: '— (Sin restaurante)' },
    ...restaurants.map(r => ({ value: r.name, label: r.name })),
  ];

  return (
    <ModalBackdrop onClose={onClose} isMobile={isMobile}>
      <ModalHeader title={isNew ? 'Nuevo Usuario' : 'Editar Usuario'} onClose={onClose} />
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <FormField label="Nombre completo">
          <TextInput value={form.name} onChange={v => set('name', v)} placeholder="Nombre completo" />
        </FormField>
        <FormField label="Email">
          <TextInput value={form.email} onChange={v => set('email', v)} placeholder="correo@ejemplo.com" type="email" />
        </FormField>
        {isNew && (
          <FormField label="Contraseña">
            <TextInput value={form.password || ''} onChange={v => set('password', v)} placeholder="Contraseña" type="password" />
          </FormField>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Rol">
            <SelectInput
              value={form.role}
              onChange={v => set('role', v)}
              options={[
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'owner', label: 'Dueño' },
                { value: 'manager', label: 'Gerente' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
          </FormField>
          <FormField label="Estado">
            <SelectInput
              value={form.status}
              onChange={v => set('status', v)}
              options={[{ value: 'active', label: 'Activo' }, { value: 'inactive', label: 'Inactivo' }]}
            />
          </FormField>
        </div>
        <FormField label="Restaurante">
          <SelectInput
            value={form.restaurant}
            onChange={v => set('restaurant', v)}
            options={restaurantOptions}
          />
        </FormField>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cancelar</button>
          <button
            onClick={() => { if (form.name.trim() && form.email.trim()) onSave(form); }}
            style={{ padding: '10px 24px', background: COLORS.green, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}
          >Guardar</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─────────────────────────────────────────────
// PACKAGE MODAL
// ─────────────────────────────────────────────
function PackageModal({ data, isMobile, onSave, onClose }) {
  const [form, setForm] = useState({ ...data });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <ModalBackdrop onClose={onClose} isMobile={isMobile}>
      <ModalHeader title={`Editar Paquete ${form.name}`} onClose={onClose} />
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <FormField label="Nombre del paquete">
          <TextInput value={form.name} onChange={v => set('name', v)} placeholder="Nombre" />
        </FormField>
        <FormField label="Precio mensual (MXN)">
          <input
            type="number"
            value={form.price}
            onChange={e => set('price', Number(e.target.value))}
            style={inputNoIconStyle}
            min={0}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Máx. usuarios (vacío = ilimitado)">
            <input
              type="number"
              value={form.users || ''}
              onChange={e => set('users', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ilimitado"
              style={inputNoIconStyle}
              min={1}
            />
          </FormField>
          <FormField label="Máx. sucursales (vacío = ilimitado)">
            <input
              type="number"
              value={form.branches || ''}
              onChange={e => set('branches', e.target.value ? Number(e.target.value) : null)}
              placeholder="Ilimitadas"
              style={inputNoIconStyle}
              min={1}
            />
          </FormField>
        </div>
        <FormField label="Tipo de soporte">
          <SelectInput
            value={form.support}
            onChange={v => set('support', v)}
            options={[
              { value: 'Email', label: 'Email' },
              { value: 'Chat prioritario', label: 'Chat prioritario' },
              { value: 'Gerente dedicado', label: 'Gerente dedicado' },
            ]}
          />
        </FormField>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cancelar</button>
          <button
            onClick={() => onSave(form)}
            style={{ padding: '10px 24px', background: COLORS.green, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600 }}
          >Guardar</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─────────────────────────────────────────────
// COMPONENT 3: RestaurantPortal
// ─────────────────────────────────────────────
function RestaurantPortal({ user, onLogout, onEnterPlatform, isMobile }) {
  const userModules = (() => {
    if (user.role === 'staff') return ['dashboard', 'menu'];
    if (user.role === 'manager') return ['dashboard', 'crm', 'menu', 'compras', 'reporteo', 'inventario'];
    return RESTAURANTS_INITIAL.find(r => r.name === user.restaurant)?.modules || ['dashboard'];
  })();

  const availableModules = ALL_MODULES.filter(m => userModules.includes(m.id));

  const roleColors = {
    owner: COLORS.green,
    manager: COLORS.blue,
    staff: COLORS.textMuted,
  };
  const accent = user.accent || COLORS.green;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bgMedium }}>
      {/* Topbar */}
      <div style={{
        background: COLORS.bgDark, borderBottom: `1px solid ${COLORS.border}`,
        padding: isMobile ? '12px 16px' : '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 18,
            flexShrink: 0,
          }}>
            {user.restaurant ? user.restaurant[0].toUpperCase() : 'R'}
          </div>
          <div>
            <div style={{ color: COLORS.text, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: isMobile ? 15 : 17 }}>
              {user.restaurant || 'Portal'}
            </div>
            {!isMobile && <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>RestoOS Platform</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
          <RoleBadge role={user.role} />
          {!isMobile && <span style={{ color: COLORS.text, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{user.name}</span>}
          <button
            onClick={onLogout}
            style={{
              padding: '8px 14px', background: 'rgba(239,83,80,0.1)',
              border: `1px solid ${COLORS.danger}33`, borderRadius: 8,
              color: COLORS.danger, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,83,80,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,83,80,0.1)'}
          >Salir</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: isMobile ? '40px 24px 32px' : '56px 48px 40px',
        background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.bgMedium} 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Accent blob */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 240, height: 240,
          background: `radial-gradient(circle, ${accent}33, transparent)`,
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 14, marginBottom: 8 }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 28 : 38, fontWeight: 800,
            color: COLORS.text, margin: '0 0 8px',
          }}>
            Bienvenido de vuelta, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 16, margin: 0 }}>
            Panel de {user.restaurant || 'tu restaurante'}
          </p>
        </div>
      </div>

      {/* Modules grid */}
      <div style={{ padding: isMobile ? '32px 16px' : '40px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: COLORS.text, fontSize: 20, margin: 0 }}>
            Módulos disponibles
          </h2>
          <span style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
            {availableModules.length} de {ALL_MODULES.length} módulos activos
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {availableModules.map((m, i) => (
            <button
              key={m.id}
              onClick={onEnterPlatform}
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: isMobile ? '16px 14px' : '20px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s',
                animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.background = `${accent}15`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.background = COLORS.bgCard;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: isMobile ? 26 : 32 }}>{m.icon}</div>
              <div style={{ color: COLORS.text, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>{m.label}</div>
              <div style={{ color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', fontSize: 12, lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onEnterPlatform}
            style={{
              padding: isMobile ? '16px 32px' : '18px 48px',
              background: COLORS.green,
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: isMobile ? 16 : 18, fontWeight: 700,
              fontFamily: 'Syne, sans-serif', cursor: 'pointer',
              transition: 'background 0.2s, transform 0.15s',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 24px rgba(43,95,74,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.greenHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.green; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Ir al Panel Completo →
          </button>
        </div>

        {/* Quick info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginTop: 48 }}>
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Tu rol</div>
            <RoleBadge role={user.role} />
          </div>
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Módulos activos</div>
            <div style={{ color: COLORS.text, fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700 }}>{availableModules.length}</div>
          </div>
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Restaurante</div>
            <div style={{ color: COLORS.text, fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 600 }}>{user.restaurant}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────
export default function ReStooSAuth({ onEnterPlatform }) {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'superadmin') {
      setView('superadmin');
    } else {
      setView('restaurant');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} isMobile={isMobile} />;
  }

  if (view === 'superadmin') {
    return <SuperAdminPanel onLogout={handleLogout} isMobile={isMobile} />;
  }

  if (view === 'restaurant') {
    return (
      <RestaurantPortal
        user={currentUser}
        onLogout={handleLogout}
        onEnterPlatform={onEnterPlatform}
        isMobile={isMobile}
      />
    );
  }

  return null;
}
