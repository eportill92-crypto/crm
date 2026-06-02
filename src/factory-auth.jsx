import React, { useState } from 'react';
import { supabase } from './supabase';

const C = {
  bg: '#0C0E14', bgMid: '#14161E', bgCard: '#1C2030', bgEl: '#1E2235',
  accent: '#1D6FA4', accentHover: '#155d8a',
  green: '#27AE60', yellow: '#F39C12', red: '#E74C3C',
  text: '#F0F1F5', muted: '#8B8FA8', border: '#2A2D3E',
};

export default function FactoryAuth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!name.trim()) { setError('El nombre es requerido'); setLoading(false); return; }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    const userId = signUpData.user?.id;
    if (!userId) { setError('Error al crear usuario'); setLoading(false); return; }

    // Check if this is the first user → admin
    const { count } = await supabase.from('factory_profiles').select('id', { count: 'exact', head: true });
    const role = count === 0 ? 'admin' : 'operator';

    const { error: profileError } = await supabase.from('factory_profiles').upsert({
      id: userId,
      name: name.trim(),
      role,
      is_active: true,
    });

    if (profileError) { setError(profileError.message); setLoading(false); return; }
    setSuccess(role === 'admin' ? 'Cuenta de administrador creada. Iniciando sesión...' : 'Cuenta creada. Iniciando sesión...');
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgEl,
    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'system-ui',
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, fontFamily: 'system-ui',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: C.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24,
          }}>⚙️</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>PanelControl</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Gestión de Máquinas de Fábrica</div>
        </div>

        {/* Card */}
        <div style={{
          background: C.bgCard, borderRadius: 16, padding: 32, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24 }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </div>

          {error && (
            <div style={{
              background: '#3d1a1a', border: `1px solid ${C.red}`, borderRadius: 8,
              padding: '10px 14px', color: '#ff8080', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              background: '#1a3d2a', border: `1px solid ${C.green}`, borderRadius: 8,
              padding: '10px 14px', color: '#6fcf97', fontSize: 13, marginBottom: 16,
            }}>{success}</div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre completo</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo electrónico</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="correo@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contraseña</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 8,
                background: loading ? '#333' : C.accent, border: 'none',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
