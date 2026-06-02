import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from './supabase';
// PanelControl - Factory Machine Management Platform

const FactoryAuth = lazy(() => import('./factory-auth'));
const FactoryOS = lazy(() => import('./factory-os'));

function LoadingScreen() {
  return (
    <div style={{
      width:'100vw',height:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',background:'#0C0E14',gap:16
    }}>
      <div style={{fontSize:28,fontWeight:700,color:'#F0F1F5',fontFamily:'system-ui'}}>PanelControl</div>
      <div style={{color:'#8B8FA8',fontSize:14}}>Cargando...</div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user);
      else setUser(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user);
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    const { data } = await supabase.from('factory_profiles').select('*').eq('id', authUser.id).single();
    setUser(data ? { ...authUser, ...data } : { ...authUser, role: 'operator', name: authUser.email });
  }

  if (user === undefined) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      {user === null
        ? <FactoryAuth onLogin={() => {}} />
        : <FactoryOS user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null); }} />
      }
    </Suspense>
  );
}
