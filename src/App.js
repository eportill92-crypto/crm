import React, { useState, Suspense, lazy } from 'react';

const ReStooSAuth = lazy(() => import('./restoos-auth'));
const RestaurantOS = lazy(() => import('./restaurant-os'));

function LoadingScreen() {
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#0C0E14', gap: 16
    }}>
      <div style={{ fontSize: 32, fontFamily: 'Syne, sans-serif', color: '#F0F1F5', fontWeight: 700, letterSpacing: '-0.5px' }}>
        RestoOS
      </div>
      <div style={{ color: '#8B8FA8', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
        Cargando plataforma...
      </div>
      <div style={{
        width: 40, height: 4, background: '#2B5F4A', borderRadius: 2,
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scaleX(1)} 50%{opacity:0.5;transform:scaleX(0.6)} }
      `}</style>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('auth'); // 'auth' | 'platform'
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {screen === 'auth'
        ? <ReStooSAuth onEnterPlatform={(user) => { setCurrentUser(user); setScreen('platform'); }} />
        : <RestaurantOS user={currentUser} onLogout={() => { setCurrentUser(null); setScreen('auth'); }} />
      }
    </Suspense>
  );
}
