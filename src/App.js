import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from './supabase';

const FactoryAuth = lazy(() => import('./factory-auth'));
const FactoryOS = lazy(() => import('./factory-os'));

function Loader() {
  return (
    <div style={{width:'100vw',height:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',background:'#0C0E14',gap:12}}>
      <div style={{fontSize:26,fontWeight:700,color:'#F0F1F5',letterSpacing:'-0.5px'}}>PanelControl</div>
      <div style={{color:'#8B8FA8',fontSize:13}}>Cargando...</div>
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) loadProfile(session.user);
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    const { data } = await supabase.from('factory_profiles').select('*').eq('id', authUser.id).single();
    setUser(data ? { ...authUser, ...data } : { ...authUser, role: 'operador', name: authUser.email });
  }

  if (user === undefined) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      {!user
        ? <FactoryAuth />
        : <FactoryOS user={user} onLogout={async () => { await supabase.auth.signOut(); }} />
      }
    </Suspense>
  );
}
