import React, { useState, useEffect } from 'react';

// ─── Restaurant config (would come from API in production) ────────────────────
const REST = {
  name: 'ESCA',
  tagline: 'Experiencia Mediterránea · CDMX',
  accent: '#2B5F4A',
  accentDark: '#1e4535',
  accentLight: '#E8F0EC',
  font: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'DM Sans', sans-serif",
};

const CATS = [
  { id: 'all',        label: 'Todo',       emoji: '🍽️' },
  { id: 'entradas',   label: 'Entradas',   emoji: '🥗' },
  { id: 'principales',label: 'Principales',emoji: '🥩' },
  { id: 'bebidas',    label: 'Bebidas',    emoji: '🍷' },
  { id: 'postres',    label: 'Postres',    emoji: '🍰' },
];

const MENU = [
  { id:1,  name:'Ceviche Mediterráneo',   desc:'Camarones y pulpo marinados en limón, con aguacate y tomate cherry',             price:245, cat:'entradas',    tags:['Sin Gluten'],          star:true  },
  { id:2,  name:'Pulpo a la Brasa',       desc:'Pulpo entero asado con aceite de oliva, pimentón y papas confitadas',            price:380, cat:'principales', tags:['Picante'],             star:true  },
  { id:3,  name:'Risotto de Hongos',      desc:'Arroz arborio con hongos silvestres, parmesano y trufa negra',                   price:295, cat:'principales', tags:['Vegano'],              star:false },
  { id:4,  name:'Lubina al Horno',        desc:'Lubina entera al horno con hierbas mediterráneas y limón',                       price:420, cat:'principales', tags:[],                      star:false },
  { id:5,  name:'Tabla de Quesos',        desc:'Selección de quesos artesanales con mermelada y nueces',                         price:185, cat:'entradas',    tags:['Sin Gluten'],          star:false },
  { id:6,  name:'Tiramisú Artesanal',     desc:'Receta original italiana con mascarpone y espresso',                             price:135, cat:'postres',     tags:[],                      star:true  },
  { id:7,  name:'Sangría de la Casa',     desc:'Vino tinto con frutas frescas de temporada',                                     price:145, cat:'bebidas',     tags:[],                      star:false },
  { id:8,  name:'Agua de Jamaica',        desc:'Agua fresca de flor de jamaica con hierbabuena',                                 price:65,  cat:'bebidas',     tags:['Vegano','Sin Gluten'], star:false },
  { id:9,  name:'Salmón Mediterráneo',    desc:'Filete de salmón en costra de hierbas con puré de coliflor',                    price:365, cat:'principales', tags:[],                      star:false },
  { id:10, name:'Bruschetta de Tomate',   desc:'Pan artesanal con tomate cherry confitado y albahaca fresca',                   price:125, cat:'entradas',    tags:['Vegano'],              star:false },
];

const TAG_META = {
  'Vegano':     { bg:'#E8F5E9', color:'#2E7D32', dot:'#4CAF50' },
  'Sin Gluten': { bg:'#E3F2FD', color:'#1565C0', dot:'#2196F3' },
  'Picante':    { bg:'#FFEBEE', color:'#C62828', dot:'#F44336' },
  'Orgánico':   { bg:'#F1F8E9', color:'#558B2F', dot:'#8BC34A' },
};

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

export default function MenuPublic({ stagingOffset }) {
  const [cat, setCat] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollRef = React.useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 100);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const featured = MENU.filter(d => d.star);
  const grouped = CATS.filter(c => c.id !== 'all').map(c => ({
    ...c,
    dishes: MENU.filter(d => d.cat === c.id),
  })).filter(g => g.dishes.length > 0 && (cat === 'all' || cat === g.id));

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Menú ${REST.name}`, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#F8F7F4', fontFamily: REST.fontBody, color: '#1C1C1C', paddingTop: stagingOffset ? 30 : 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        body{margin:0;background:#F8F7F4}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(150deg, ${REST.accent} 0%, ${REST.accentDark} 100%)`, padding: '52px 24px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ width:68, height:68, borderRadius:20, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontFamily:REST.font, color:'#fff', fontSize:34, fontWeight:700 }}>E</div>
          <h1 style={{ color:'#fff', fontFamily:REST.font, fontSize:42, fontWeight:700, letterSpacing:'-0.5px', margin:'0 0 6px' }}>{REST.name}</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14, margin:'0 0 22px' }}>{REST.tagline}</p>
          <button onClick={handleShare} style={{ background:'rgba(255,255,255,0.14)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:100, padding:'9px 22px', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:REST.fontBody, display:'inline-flex', alignItems:'center', gap:7, backdropFilter:'blur(4px)' }}>
            <ShareIcon/> {copied ? '¡Enlace copiado!' : 'Compartir menú'}
          </button>
        </div>
      </div>

      {/* ── Sticky category filter ── */}
      <div style={{ position:'sticky', top:0, zIndex:20, background: scrolled ? 'rgba(248,247,244,0.96)' : '#F8F7F4', backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent', transition:'all 0.2s', padding:'10px 16px' }}>
        <div style={{ maxWidth:740, margin:'0 auto', display:'flex', gap:7, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:2 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ padding:'7px 17px', borderRadius:100, border:`1.5px solid ${cat === c.id ? REST.accent : '#E0DDD6'}`, background: cat === c.id ? REST.accent : '#fff', color: cat === c.id ? '#fff' : '#777', cursor:'pointer', fontSize:13, fontFamily:REST.fontBody, fontWeight: cat === c.id ? 600 : 400, whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:740, margin:'0 auto', padding:'28px 16px 72px' }}>

        {/* Featured horizontal scroll — only when "all" selected */}
        {cat === 'all' && featured.length > 0 && (
          <div style={{ marginBottom:40, animation:'fadeUp 0.35s ease' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:20 }}>⭐</span>
              <h2 style={{ fontFamily:REST.font, fontSize:23, fontWeight:700, color:'#1C1C1C', margin:0 }}>Destacados del chef</h2>
            </div>
            <div style={{ display:'flex', gap:12, overflowX:'auto', WebkitOverflowScrolling:'touch', paddingBottom:8 }}>
              {featured.map(d => (
                <div key={d.id} style={{ minWidth:215, background:'#fff', borderRadius:20, padding:'20px 18px', border:`1.5px solid ${REST.accent}22`, boxShadow:`0 4px 20px ${REST.accent}12`, flexShrink:0 }}>
                  <div style={{ fontFamily:REST.font, fontSize:18, fontWeight:600, color:'#1C1C1C', marginBottom:7, lineHeight:1.3 }}>{d.name}</div>
                  <div style={{ fontSize:12, color:'#999', lineHeight:1.55, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{d.desc}</div>
                  {d.tags.length > 0 && (
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
                      {d.tags.map(tag => {
                        const tm = TAG_META[tag] || { bg:'#F5F5F5', color:'#666', dot:'#999' };
                        return <span key={tag} style={{ background:tm.bg, color:tm.color, padding:'2px 8px', borderRadius:100, fontSize:10, fontWeight:700 }}>{tag}</span>;
                      })}
                    </div>
                  )}
                  <div style={{ fontFamily:REST.font, fontSize:26, fontWeight:700, color:REST.accent }}>${d.price} <span style={{ fontSize:13, fontFamily:REST.fontBody, fontWeight:400, color:'#ccc' }}>MXN</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped dish list */}
        {grouped.map((g, gi) => (
          <div key={g.id} style={{ marginBottom:36, animation:`fadeUp ${0.2 + gi * 0.05}s ease` }}>
            {cat === 'all' && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:12, borderBottom:`1.5px solid #EDEAE4` }}>
                <span style={{ fontSize:22 }}>{g.emoji}</span>
                <h2 style={{ fontFamily:REST.font, fontSize:22, fontWeight:700, color:'#1C1C1C', margin:0 }}>{g.label}</h2>
              </div>
            )}
            {cat !== 'all' && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <span style={{ fontSize:26 }}>{g.emoji}</span>
                <h2 style={{ fontFamily:REST.font, fontSize:26, fontWeight:700, color:'#1C1C1C', margin:0 }}>{g.label}</h2>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {g.dishes.map(d => (
                <div key={d.id} style={{ background:'#fff', borderRadius:16, padding:'16px 18px', border:'1px solid #EDEAE4', boxShadow:'0 1px 6px rgba(0,0,0,0.04)', display:'flex', justifyContent:'space-between', gap:16, alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                      <span style={{ fontFamily:REST.font, fontSize:17, fontWeight:600, color:'#1C1C1C' }}>{d.name}</span>
                      {d.star && <span style={{ fontSize:13 }}>⭐</span>}
                    </div>
                    <p style={{ fontSize:13, color:'#888', lineHeight:1.55, margin: d.tags.length ? '0 0 10px' : 0 }}>{d.desc}</p>
                    {d.tags.length > 0 && (
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {d.tags.map(tag => {
                          const tm = TAG_META[tag] || { bg:'#F5F5F5', color:'#666', dot:'#999' };
                          return (
                            <span key={tag} style={{ background:tm.bg, color:tm.color, padding:'3px 9px', borderRadius:100, fontSize:11, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4 }}>
                              <span style={{ width:5, height:5, borderRadius:'50%', background:tm.dot, display:'inline-block', flexShrink:0 }}/>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, paddingTop:2 }}>
                    <div style={{ fontFamily:REST.font, fontSize:24, fontWeight:700, color:REST.accent, lineHeight:1 }}>${d.price}</div>
                    <div style={{ fontSize:10, color:'#CCC', marginTop:3 }}>MXN</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#BBB', fontFamily:REST.fontBody }}>
            Sin platillos en esta categoría
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign:'center', padding:'20px 16px 40px', borderTop:'1px solid #EDEAE4' }}>
        <p style={{ fontSize:12, color:'#C8C5BF', margin:0 }}>
          Menú digital por <strong style={{ color:'#AAA' }}>Comensaia</strong>
        </p>
      </div>
    </div>
  );
}
