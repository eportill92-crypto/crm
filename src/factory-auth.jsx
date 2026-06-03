import React, { useState } from 'react';
import { supabase } from './supabase';

const C = {
  bg: '#0C0E14', bgMid: '#14161E', bgCard: '#1C2030', bgEl: '#1E2235',
  accent: '#1D6FA4', accentHover: '#155d8a',
  green: '#27AE60', greenBg: 'rgba(39,174,96,0.12)',
  yellow: '#F39C12', yellowBg: 'rgba(243,156,18,0.12)',
  red: '#E74C3C', redBg: 'rgba(231,76,60,0.12)',
  gray: '#95A5A6', grayBg: 'rgba(149,165,166,0.12)',
  text: '#F0F1F5', muted: '#8B8FA8', border: '#2A2D3E',
};

export default function FactoryAuth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!name.trim()) throw new Error('El nombre es requerido');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const { count } = await supabase
            .from('factory_profiles')
            .select('*', { count: 'exact', head: true });
          const role = count === 0 ? 'gerente' : 'operador';
          await supabase.from('factory_profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            role,
            is_active: true,
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    background: C.bgEl,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    color: C.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    color: C.muted,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: C.bgCard,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        padding: 36,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `rgba(29,111,164,0.15)`,
            border: `1px solid rgba(29,111,164,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 22,
          }}>
            ⚙
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 4 }}>
            PanelControl
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>Sistema de Control de Máquinas</div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: C.bg,
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          gap: 4,
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? C.accent : 'transparent',
                color: mode === m ? '#fff' : C.muted,
                transition: 'all 0.2s',
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre completo"
                style={inputStyle}
                required
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@empresa.com"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              required
              minLength={6}
            />
          </div>

          {mode === 'register' && (
            <div style={{
              background: 'rgba(29,111,164,0.08)',
              border: `1px solid rgba(29,111,164,0.25)`,
              borderRadius: 8,
              padding: '12px 14px',
              color: C.muted,
              fontSize: 12,
              lineHeight: 1.6,
            }}>
              El primer usuario registrado será{' '}
              <strong style={{ color: C.accent }}>Gerente</strong>.
              Los siguientes serán{' '}
              <strong style={{ color: C.gray }}>Operadores</strong>.
            </div>
          )}

          {error && (
            <div style={{
              background: C.redBg,
              border: `1px solid ${C.red}`,
              borderRadius: 8,
              padding: '10px 14px',
              color: C.red,
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 0',
              background: loading ? C.accentHover : C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 2,
              transition: 'background 0.2s',
            }}
          >
            {loading
              ? 'Procesando...'
              : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
