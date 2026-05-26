import React, { useState, Suspense, lazy } from 'react';

const ReStooSAuth = lazy(() => import('./restoos-auth'));
const RestaurantOS = lazy(() => import('./restaurant-os'));
const MenuPublic   = lazy(() => import('./menu-public'));

const ENV = process.env.REACT_APP_ENV || 'production';
const IS_STAGING = ENV === 'staging' || ENV === 'preview';

function isMenuDomain() {
  const host = window.location.hostname;
  const path = window.location.pathname;
  return host.startsWith('menu.') || host.startsWith('menu-') ||
         path === '/menu' || path.startsWith('/menu/');
}

function StagingBanner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: 'linear-gradient(90deg, #F59E0B, #D97706)',
      color: '#fff', textAlign: 'center', padding: '6px 12px',
      fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
      letterSpacing: '0.5px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 8,
    }}>
      <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 4, padding: '1px 7px', fontSize: 10 }}>
        STAGING
      </span>
      Ambiente de pruebas — los cambios aquí no afectan producción
    </div>
  );
}

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
  const [screen, setScreen] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);

  if (isMenuDomain()) {
    return (
      <>
        {IS_STAGING && <StagingBanner />}
        <Suspense fallback={<LoadingScreen />}>
          <MenuPublic stagingOffset={IS_STAGING} />
        </Suspense>
      </>
    );
  }

  return (
    <>
      {IS_STAGING && <StagingBanner />}
      <Suspense fallback={<LoadingScreen />}>
        {screen === 'auth'
          ? <ReStooSAuth
              onEnterPlatform={(user) => { setCurrentUser(user); setScreen('platform'); }}
              stagingOffset={IS_STAGING}
            />
          : <RestaurantOS
              user={currentUser}
              onLogout={() => { setCurrentUser(null); setScreen('auth'); }}
              stagingOffset={IS_STAGING}
            />
        }
      </Suspense>
    </>
  );
}
