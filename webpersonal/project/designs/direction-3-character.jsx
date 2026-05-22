// Direction 3 — Tech con Carácter
// Dark, modern sans, vivid amber accent, layered cards, motion-friendly

function CharacterDesign() {
  const W = 1280;
  const bg = '#0c0c0e';
  const surface = 'rgba(255,255,255,0.03)';
  const border = 'rgba(255,255,255,0.08)';
  const ink = '#f4f4f5';
  const sub = '#9a9aa3';
  const dim = '#5a5a63';
  const accent = '#ff8a3d';
  const accentSoft = 'rgba(255,138,61,0.15)';

  const Pill = ({ children, color = sub }) => (
    <span style={{
      fontSize: 11, color, border: `1px solid ${border}`, padding: '4px 10px',
      borderRadius: 999, background: 'rgba(255,255,255,0.02)'
    }}>{children}</span>
  );

  const ProjectCard = ({ idx, title, desc, tags, status, big }) => (
    <div style={{
      gridColumn: big ? 'span 2' : 'span 1',
      background: surface, border: `1px solid ${border}`, borderRadius: 20,
      padding: 28, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: 14, minHeight: big ? 280 : 240
    }}>
      {/* visual area */}
      <div style={{
        height: big ? 120 : 88, borderRadius: 12, marginBottom: 6,
        background: idx === 1
          ? `linear-gradient(135deg, ${accent} 0%, #b94a14 100%)`
          : idx === 2
          ? `linear-gradient(135deg, #2a3142 0%, #1a1d28 100%)`
          : `linear-gradient(135deg, #5b4ae6 0%, #2a1f7a 100%)`,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 10px)'
        }} />
        <div style={{
          position: 'absolute', right: 14, top: 12,
          fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: 'JetBrains Mono, monospace'
        }}>0{idx} / live</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
        <span style={{ fontSize: 11, color: sub, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{status}</span>
      </div>
      <h3 style={{ margin: 0, fontSize: big ? 28 : 22, fontWeight: 600, letterSpacing: '-0.02em', color: ink, lineHeight: 1.15 }}>{title}</h3>
      <p style={{ margin: 0, color: sub, fontSize: 13.5, lineHeight: 1.55, textWrap: 'pretty' }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
        {tags.map(t => <Pill key={t}>{t}</Pill>)}
      </div>
    </div>
  );

  return (
    <div style={{
      width: W, fontFamily: 'Inter, -apple-system, sans-serif',
      background: bg, color: ink, position: 'relative', overflow: 'hidden'
    }}>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', top: -200, right: -100, width: 700, height: 700,
        background: `radial-gradient(circle, ${accent}26, transparent 60%)`,
        pointerEvents: 'none', filter: 'blur(20px)'
      }} />

      {/* Nav */}
      <header style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 56px',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}, #b94a14)`,
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 16, color: '#1a0f08',
            boxShadow: `0 0 20px ${accent}66`
          }}>J</div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>jesusrodriguez<span style={{ color: accent }}>.dev</span></span>
        </div>
        <nav style={{
          display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${border}`, borderRadius: 999, padding: 4
        }}>
          {['Proyectos', 'Blog', 'Sobre mí', 'Contacto'].map((n, i) => (
            <span key={n} style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13,
              background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: i === 0 ? ink : sub, fontWeight: i === 0 ? 500 : 400
            }}>{n}</span>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 999, border: `1px solid ${border}`,
            background: accentSoft, fontSize: 12, color: accent
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 8px ${accent}` }} />
            Disponible para proyectos
          </span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '96px 56px 64px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '6px 14px', borderRadius: 999, border: `1px solid ${border}`,
          background: 'rgba(255,255,255,0.03)', marginBottom: 32
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
          <span style={{ fontSize: 12, color: sub, letterSpacing: '0.04em' }}>
            Learning in public <span style={{ color: dim }}>·</span> Building in public
          </span>
        </div>

        <h1 style={{
          margin: 0, fontSize: 104, fontWeight: 600, letterSpacing: '-0.045em',
          lineHeight: 0.96, maxWidth: 1100
        }}>
          Hola, soy <span style={{
            background: `linear-gradient(135deg, ${accent}, #ffb98a 60%, #fff)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Jesús</span>.<br/>
          <span style={{ color: '#d0d0d8' }}>Diseño, construyo</span><br/>
          <span style={{ color: '#d0d0d8' }}>y enseño </span>
          <span style={{ position: 'relative', display: 'inline-block' }}>
            software
            <svg width="380" height="14" style={{ position: 'absolute', left: 0, bottom: -10 }} viewBox="0 0 380 14" preserveAspectRatio="none">
              <path d="M2 8 Q 95 1, 190 7 T 378 6" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </span>.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, marginTop: 56, alignItems: 'end' }}>
          <p style={{ fontSize: 19, color: sub, lineHeight: 1.55, margin: 0, maxWidth: 560, textWrap: 'pretty' }}>
            Desarrollador con foco en <span style={{ color: ink, fontWeight: 500 }}>.NET</span>,
            {' '}<span style={{ color: ink, fontWeight: 500 }}>Angular</span> e
            {' '}<span style={{ color: ink, fontWeight: 500 }}>Inteligencia Artificial</span>.
            Centralizo mis proyectos, documento lo que aprendo cada día y comparto el proceso.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              background: accent, color: '#1a0f08', border: 'none',
              padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', boxShadow: `0 8px 24px ${accent}40`
            }}>Ver proyectos →</button>
            <button style={{
              background: 'rgba(255,255,255,0.04)', color: ink,
              border: `1px solid ${border}`, padding: '14px 22px',
              borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>Blog · TIL</button>
          </div>
        </div>
      </section>

      {/* Stats marquee */}
      <section style={{
        padding: '28px 56px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
        display: 'flex', gap: 56, alignItems: 'center', overflow: 'hidden'
      }}>
        {[
          ['06', 'Proyectos live'],
          ['02', 'Posts publicados'],
          ['2+', 'Años publicando'],
          ['100%', 'Open source'],
          ['<24h', 'Último commit'],
          ['10+', 'Repos activos']
        ].map(([n, l], i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: ink }}>{n}</span>
              <span style={{ fontSize: 12, color: sub, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
            </div>
            {i < 5 && <span style={{ color: dim, fontSize: 18 }}>✦</span>}
          </React.Fragment>
        ))}
      </section>

      {/* Projects */}
      <section style={{ padding: '88px 56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14 }}>
              ↳ Proyectos
            </div>
            <h2 style={{ margin: 0, fontSize: 56, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, maxWidth: 700 }}>
              Selección de lo que<br/>he construido <span style={{ color: dim }}>recientemente.</span>
            </h2>
          </div>
          <span style={{ fontSize: 14, color: sub, display: 'flex', alignItems: 'center', gap: 8 }}>
            Ver todos (06) <span style={{ color: accent }}>→</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          <ProjectCard idx={1} title="Blog de Programación"
            desc="Repositorio vivo de conocimientos técnicos: tutoriales, snippets y buenas prácticas. .NET, Angular y desarrollo web moderno." 
            tags={['GitHub Pages', 'JavaScript', 'Blog']} status="Live" big />
          <ProjectCard idx={2} title="CV Interactivo"
            desc="Perfil profesional en formato web. Experiencia, skills y formación en una interfaz visual moderna."
            tags={['Astro', 'TypeScript']} status="Live" />
          <ProjectCard idx={3} title="Caligrafía Pearl"
            desc="Herramienta web para practicar caligrafía digital. Minimalismo + funcionalidad."
            tags={['Vercel', 'JS', 'Arte']} status="Live" />
        </div>
      </section>

      {/* Blog */}
      <section style={{ padding: '32px 56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14 }}>
              ↳ Blog · TIL
            </div>
            <h2 style={{ margin: 0, fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
              Aprendizaje, día a día.
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[
            { tag: 'POST', tagColor: accent, date: '10 may 2026', title: 'Astro Content Collections: type safety para tu blog', desc: 'defineCollection + z.object() = posts tipados con validación en build time. Cero sorpresas en producción.', meta: ['Astro', 'TypeScript', 'Zod'] },
            { tag: 'TIL', tagColor: '#5b4ae6', date: '08 may 2026', title: 'ImmutableArray vs FrozenSet en .NET 8', desc: 'FrozenSet → read-many-write-never. ImmutableHashSet → safe concurrency + occasional writes.', meta: ['.NET', 'C#', 'Performance'] }
          ].map((p, i) => (
            <article key={i} style={{
              background: surface, border: `1px solid ${border}`, borderRadius: 20,
              padding: 32, display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  background: p.tagColor, color: '#0c0c0e',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  fontWeight: 700, padding: '4px 9px', borderRadius: 4, letterSpacing: '0.08em'
                }}>{p.tag}</span>
                <span style={{ fontSize: 12, color: sub, fontFamily: 'JetBrains Mono, monospace' }}>{p.date}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{p.title}</h3>
              <p style={{ margin: 0, color: sub, fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                {p.meta.map(m => <Pill key={m}>{m}</Pill>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accent, fontSize: 13, marginTop: 4 }}>
                Leer post <span>→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 56px 88px' }}>
        <div style={{
          position: 'relative',
          borderRadius: 28, overflow: 'hidden',
          background: `linear-gradient(135deg, #1a1308 0%, #0c0c0e 60%)`,
          border: `1px solid ${border}`,
          padding: '72px 64px'
        }}>
          <div style={{
            position: 'absolute', top: -100, right: -50, width: 500, height: 500,
            background: `radial-gradient(circle, ${accent}40, transparent 60%)`,
            filter: 'blur(10px)'
          }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16 }}>
                ↳ Trabajemos juntos
              </div>
              <h2 style={{ margin: 0, fontSize: 56, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
                ¿Un proyecto en mente?<br/>
                <span style={{ color: sub }}>Hablemos.</span>
              </h2>
              <p style={{ color: sub, fontSize: 16, marginTop: 18, maxWidth: 540, lineHeight: 1.6 }}>
                Abierto a proyectos interesantes, colaboraciones y conversaciones sobre IA, .NET o desarrollo web.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
              <button style={{
                background: accent, color: '#1a0f08', border: 'none',
                padding: '16px 24px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', boxShadow: `0 10px 30px ${accent}50`
              }}>Ponerse en contacto →</button>
              <button style={{
                background: 'rgba(255,255,255,0.04)', color: ink,
                border: `1px solid ${border}`, padding: '16px 24px',
                borderRadius: 14, fontSize: 14, cursor: 'pointer'
              }}>Ver en LinkedIn ↗</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '36px 56px', borderTop: `1px solid ${border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: sub, fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>© 2026 · Jesús P. Rodríguez</span>
          <span style={{ color: dim }}>·</span>
          <span>Hecho con Astro · desplegado en Vercel</span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          <span>GitHub ↗</span><span>LinkedIn ↗</span><span>RSS</span>
        </div>
      </footer>
    </div>
  );
}

window.CharacterDesign = CharacterDesign;
