import React, { useState } from 'react';
import { supabase } from './supabase';

const C = {
  bg: '#0C0E14', bgCard: '#14161E', bgInput: '#1C2030',
  accent: '#1D6FA4', text: '#F0F1F5', muted: '#8B8FA8', border: '#2A2D3E',
  error: '#E74C3C'
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
          const { count } = await supabase.from('factory_profiles').select('*', { count: 'exact', head: true });
          const role = (count === 0) ? 'admin' : 'operator';
          await supabase.from('factory_profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            role,
            is_active: true
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
    background: C.bgInput,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    color: C.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    color: C.muted,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: C.bgCard,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        padding: 32
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', marginBottom: 4 }}>
            PanelControl
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>Sistema de Control de Máquinas</div>
        </div>

        <div style={{
          display: 'flex',
          background: '#0C0E14',
          borderRadius: 8,
          padding: 3,
          marginBottom: 24,
          gap: 3
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? C.accent : 'transparent',
                color: mode === m ? '#fff' : C.muted,
                transition: 'all 0.2s'
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Nombre</label>
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

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.12)',
              border: `1px solid ${C.error}`,
              borderRadius: 8,
              padding: '10px 14px',
              color: C.error,
              fontSize: 13
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              background: loading ? '#155d8a' : C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'background 0.2s'
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
