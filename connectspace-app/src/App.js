import React, { Suspense, lazy } from 'react';

const ConnectSpace = lazy(() => import('./workspace'));

function Loader() {
  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#04111E', flexDirection:'column', gap:12 }}>
      <svg width="40" height="40" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#F15B2B"/>
        <g transform="rotate(90, 50, 50)">
          <text x="50" y="68" textAnchor="middle" fontSize="72" fontWeight="900"
            fontFamily="Inter, sans-serif" fill="white" letterSpacing="-4">C</text>
        </g>
      </svg>
      <div style={{ color:'#8BA3B8', fontSize:13, fontFamily:'Inter, sans-serif' }}>Cargando ConnectSpace...</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <ConnectSpace />
    </Suspense>
  );
}
