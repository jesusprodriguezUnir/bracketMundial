// Direction 1 — Editorial Minimal
// Light, serif headlines, mono metadata, generous whitespace

function EditorialDesign() {
  const W = 1280;
  const accent = '#0a0a0a';
  const ink = '#111111';
  const sub = '#666666';
  const line = '#e6e2da';
  const paper = '#f6f3ec';
  const card = '#ffffff';

  const stat = (n, label) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: ink }}>{n}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
    </div>
  );

  const projectRow = (idx, title, desc, tags, status) => (
    <div style={{
      display: 'grid', gridTemplateColumns: '80px 1fr 220px 100px',
      padding: '32px 0', borderTop: `1px solid ${line}`, alignItems: 'start', gap: 24
    }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: sub, paddingTop: 6 }}>0{idx}/</span>
      <div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', margin: 0, color: ink, lineHeight: 1.1 }}>{title}</h3>
        <p style={{ fontSize: 14.5, color: sub, lineHeight: 1.6, margin: '10px 0 0', maxWidth: 480 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8 }}>
        {tags.map(t => (
          <span key={t} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: sub, border: `1px solid ${line}`, borderRadius: 999, padding: '4px 10px' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: status === 'Live' ? '#1f8a5b' : '#a8a29a' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{status}</span>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink, marginLeft: 4 }}>→</span>
      </div>
    </div>
  );

  return (
    <div style={{
      width: W, fontFamily: 'Inter, -apple-system, sans-serif',
      background: paper, color: ink, overflow: 'hidden'
    }}>
      {/* Nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 64px', borderBottom: `1px solid ${line}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 6, background: ink, color: paper,
            display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif',
            fontSize: 18, fontStyle: 'italic'
          }}>J</span>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, letterSpacing: '-0.01em' }}>Jesús P. Rodríguez</span>
        </div>
        <nav style={{ display: 'flex', gap: 36, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: sub, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          <span>Proyectos</span><span>Blog</span><span>Sobre mí</span><span>Contacto</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#1f8a5b' }} />
          <span>DISPONIBLE</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '88px 64px 96px', position: 'relative' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 32 }}>
          Madrid, ES · {new Date().getFullYear()} · Issue Nº 01
        </div>
        <h1 style={{
          fontFamily: 'Fraunces, serif', fontWeight: 300,
          fontSize: 120, lineHeight: 0.95, letterSpacing: '-0.04em',
          margin: 0, color: ink, maxWidth: 1000
        }}>
          Construyo cosas<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>útiles</span> en .NET,<br/>
          Angular & IA.
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 64, marginTop: 56, alignItems: 'end' }}>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#3a3a3a', maxWidth: 560, margin: 0, textWrap: 'pretty' }}>
            Desarrollador senior. Aquí centralizo lo que construyo, documento lo que aprendo
            cada día y comparto el proceso — <em style={{ fontFamily: 'Fraunces, serif' }}>learning &amp; building in public</em>.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{
              background: ink, color: paper, border: 'none', padding: '16px 22px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0
            }}>Ver proyectos →</button>
            <button style={{
              background: 'transparent', color: ink, border: `1px solid ${ink}`,
              padding: '16px 22px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 0
            }}>Blog · TIL</button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`,
        padding: '40px 64px', gap: 0
      }}>
        <div>{stat('06', 'Proyectos live')}</div>
        <div style={{ borderLeft: `1px solid ${line}`, paddingLeft: 32 }}>{stat('02', 'Posts publicados')}</div>
        <div style={{ borderLeft: `1px solid ${line}`, paddingLeft: 32 }}>{stat('2+', 'Años publicando')}</div>
        <div style={{ borderLeft: `1px solid ${line}`, paddingLeft: 32 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontStyle: 'italic', lineHeight: 1.3, color: ink, marginTop: 6 }}>
            "Lo que no se documenta, no existe."
          </div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ padding: '88px 64px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 64, fontWeight: 300, letterSpacing: '-0.03em', margin: 0, color: ink }}>
            Proyectos<span style={{ fontStyle: 'italic' }}> destacados</span>
          </h2>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Ver todos (06) →
          </span>
        </div>
        <p style={{ fontSize: 15, color: sub, margin: '0 0 32px', maxWidth: 520 }}>
          Una selección curada. Cada proyecto vive, se mantiene y enseña algo.
        </p>
        {projectRow(1, 'Blog de Programación',
          'Repositorio vivo de conocimientos técnicos: tutoriales, snippets y buenas prácticas sobre .NET, Angular y desarrollo web moderno.',
          ['GitHub Pages', 'JavaScript', 'Blog'], 'Live')}
        {projectRow(2, 'Curriculum Vitae Interactivo',
          'Perfil profesional en formato web. Experiencia, habilidades técnicas y formación presentadas en una interfaz visual moderna y explorable.',
          ['Astro', 'TypeScript', 'CV'], 'Live')}
        {projectRow(3, 'Caligrafía Pearl',
          'Herramienta web para explorar y practicar caligrafía digital. Combina estética minimalista con funcionalidad de práctica.',
          ['Vercel', 'JavaScript', 'Arte digital'], 'Live')}
        <div style={{ borderTop: `1px solid ${line}` }} />
      </section>

      {/* Blog teaser */}
      <section style={{ padding: '0 64px 96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {[
          { tag: 'NUEVO', date: '10 MAY 2026', title: 'Astro Content Collections: type safety para tu blog', desc: 'defineCollection + z.object() = posts tipados con validación en build time. Cero sorpresas en producción.', meta: 'Astro · TypeScript · Zod' },
          { tag: 'TIL', date: '08 MAY 2026', title: 'ImmutableArray vs FrozenSet en .NET 8', desc: 'FrozenSet es read-many-write-never. ImmutableHashSet es safe concurrency + occasional writes. Elige según el patrón de acceso.', meta: '.NET · C# · Performance' }
        ].map((p, i) => (
          <article key={i} style={{
            background: card, border: `1px solid ${line}`, padding: 36,
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: sub }}>
              <span style={{ background: ink, color: paper, padding: '3px 8px' }}>{p.tag}</span>
              <span>{p.date}</span>
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15, color: ink }}>{p.title}</h3>
            <p style={{ fontSize: 14.5, color: '#444', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span>{p.meta}</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: ink }}>→</span>
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section style={{
        padding: '120px 64px', textAlign: 'center', background: ink, color: paper
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 28 }}>
          ¿Trabajamos juntos?
        </div>
        <h2 style={{
          fontFamily: 'Fraunces, serif', fontSize: 88, fontWeight: 300, letterSpacing: '-0.04em',
          margin: 0, lineHeight: 1, maxWidth: 900, marginInline: 'auto'
        }}>
          Buenos proyectos<br/><em>empiezan</em> con buenas conversaciones.
        </h2>
        <div style={{ marginTop: 48, display: 'inline-flex', gap: 12 }}>
          <button style={{
            background: paper, color: ink, border: 'none', padding: '18px 28px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer'
          }}>Ponerse en contacto →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 64px', display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sub, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        <span>© 2026 · Jesús P. Rodríguez</span>
        <span style={{ display: 'flex', gap: 20 }}>
          <span>GitHub ↗</span><span>LinkedIn ↗</span><span>RSS</span>
        </span>
      </footer>
    </div>
  );
}

window.EditorialDesign = EditorialDesign;
