// Direction 2 — Developer Terminal
// Dark, monospaced, terminal-inspired but elevated (not literal CLI screenshot)

function TerminalDesign() {
  const W = 1280;
  const bg = '#0b0d0c';
  const surface = '#111413';
  const ink = '#e6e8e3';
  const sub = '#7a807a';
  const dim = '#3d4340';
  const accent = '#7cdc8f'; // terminal green
  const amber = '#d4a857';

  const prompt = (path, cmd) => (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ color: accent }}>jesus@dev</span>
      <span style={{ color: sub }}>:</span>
      <span style={{ color: '#8fb4ff' }}>{path}</span>
      <span style={{ color: sub }}>$</span>
      <span style={{ color: ink }}>{cmd}</span>
    </div>
  );

  const card = (i, title, desc, tags, status, lang) => (
    <div style={{
      background: surface, border: `1px solid ${dim}`, padding: 22,
      display: 'flex', flexDirection: 'column', gap: 12, position: 'relative'
    }}>
      {/* tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#28c840' }} />
        </div>
        <span style={{ color: sub, fontSize: 11 }}>~/projects/0{i}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: amber, fontSize: 11 }}>0{i}</span>
        <span style={{ color: sub, fontSize: 11 }}>—</span>
        <span style={{ color: accent, fontSize: 11 }}>{lang}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: status === 'live' ? accent : sub, boxShadow: status === 'live' ? `0 0 8px ${accent}` : 'none' }} />
          <span style={{ color: status === 'live' ? accent : sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{status}</span>
        </span>
      </div>
      <h3 style={{ margin: 0, color: ink, fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ margin: 0, color: sub, fontSize: 13, lineHeight: 1.55 }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: 10.5, color: sub, border: `1px solid ${dim}`, padding: '3px 8px' }}>{t}</span>
        ))}
      </div>
      <div style={{ marginTop: 6, display: 'flex', gap: 14, fontSize: 11 }}>
        <span style={{ color: accent }}>→ live</span>
        <span style={{ color: '#8fb4ff' }}>→ repo</span>
        <span style={{ color: sub }}>→ detalle</span>
      </div>
    </div>
  );

  return (
    <div style={{
      width: W, fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      background: bg, color: ink, fontSize: 13, lineHeight: 1.5,
      backgroundImage: `radial-gradient(circle at 20% 0%, rgba(124,220,143,0.06), transparent 50%), radial-gradient(circle at 80% 100%, rgba(212,168,87,0.04), transparent 50%)`
    }}>
      {/* Nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: `1px solid ${dim}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: accent }}>~</span>
          <span style={{ color: ink, fontSize: 14 }}>jesus.dev</span>
          <span style={{ color: sub, fontSize: 11 }}>v2.1.0</span>
        </div>
        <nav style={{ display: 'flex', gap: 28, fontSize: 12 }}>
          <span><span style={{ color: sub }}>$</span> <span style={{ color: accent }}>proyectos</span></span>
          <span style={{ color: sub }}>$ blog</span>
          <span style={{ color: sub }}>$ sobre-mi</span>
          <span style={{ color: sub }}>$ contacto</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: sub, fontSize: 11 }}>⌘K</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: accent, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 8px ${accent}` }} />
            ONLINE
          </span>
        </div>
      </header>

      {/* Hero — terminal window */}
      <section style={{ padding: '56px 48px 40px' }}>
        <div style={{
          border: `1px solid ${dim}`, background: surface,
          borderRadius: 6, overflow: 'hidden', maxWidth: 1080, marginInline: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${dim}`, background: '#0a0c0b' }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <span style={{ width: 12, height: 12, borderRadius: 999, background: '#ff5f57' }} />
              <span style={{ width: 12, height: 12, borderRadius: 999, background: '#febc2e' }} />
              <span style={{ width: 12, height: 12, borderRadius: 999, background: '#28c840' }} />
            </div>
            <span style={{ color: sub, fontSize: 11 }}>jesus@dev — ~/ — zsh</span>
            <span style={{ color: sub, fontSize: 11 }}>80×24</span>
          </div>
          <div style={{ padding: '24px 28px', fontSize: 13.5 }}>
            {prompt('~', 'whoami')}
            <div style={{ color: ink, margin: '6px 0 18px', paddingLeft: 0 }}>
              <span style={{ color: amber }}>Jesús P. Rodríguez</span> — Senior dev · Madrid, ES
            </div>
            {prompt('~', 'cat about.md')}
            <div style={{ color: ink, margin: '6px 0 18px', maxWidth: 760, lineHeight: 1.7 }}>
              Construyo cosas útiles en <span style={{ color: accent }}>.NET</span>, <span style={{ color: accent }}>Angular</span> e <span style={{ color: accent }}>IA</span>.<br/>
              Centralizo mis proyectos, documento lo que aprendo cada día,
              y comparto el proceso de construir.<br/>
              <span style={{ color: sub }}># learning in public · building in public</span>
            </div>
            {prompt('~', 'ls -la --status=live')}
          </div>
        </div>

        {/* Big stamp under terminal */}
        <h1 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 96, fontWeight: 500,
          letterSpacing: '-0.04em', lineHeight: 0.95, margin: '64px 0 0', color: ink, textAlign: 'left'
        }}>
          <span style={{ color: sub }}>&gt;_</span> hola, soy<br/>
          <span style={{ color: accent }}>jesús.</span><span style={{ color: sub, fontSize: 80 }}>{'/* dev */'}</span>
        </h1>

        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <button style={{
            background: accent, color: bg, border: 'none', padding: '14px 22px',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 4
          }}>$ ver_proyectos</button>
          <button style={{
            background: 'transparent', color: ink, border: `1px solid ${dim}`,
            padding: '14px 22px', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', borderRadius: 4
          }}>$ leer_blog</button>
          <button style={{
            background: 'transparent', color: ink, border: `1px solid ${dim}`,
            padding: '14px 22px', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', borderRadius: 4
          }}>$ man jesus</button>
        </div>
      </section>

      {/* Stats: as a faux env output */}
      <section style={{ padding: '32px 48px 32px' }}>
        <div style={{ border: `1px solid ${dim}`, background: surface, padding: '22px 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            ['PROJECTS_LIVE', '06', accent],
            ['POSTS_PUBLISHED', '02', amber],
            ['YEARS_BUILDING', '2+', '#8fb4ff'],
            ['LAST_COMMIT', '< 24h', accent]
          ].map(([k, v, c]) => (
            <div key={k}>
              <div style={{ color: sub, fontSize: 11, marginBottom: 6 }}>{k}=</div>
              <div style={{ color: c, fontSize: 28, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects header */}
      <section style={{ padding: '40px 48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: sub, fontSize: 11, marginBottom: 6 }}># proyectos.destacados</div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>
              <span style={{ color: accent }}>const</span> projects = <span style={{ color: amber }}>[</span>
            </h2>
          </div>
          <span style={{ color: sub, fontSize: 12 }}>// 03 de 06 →</span>
        </div>
      </section>

      <section style={{ padding: '12px 48px 24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {card(1, 'blog-programacion',
          'Repositorio vivo de conocimientos técnicos: tutoriales, snippets y buenas prácticas sobre desarrollo web.',
          ['github-pages', 'js', 'html/css'], 'live', 'js')}
        {card(2, 'cv-interactivo',
          'Perfil profesional en formato web. Experiencia y stack presentados en interfaz visual moderna.',
          ['astro', 'ts', 'cv'], 'live', 'ts')}
        {card(3, 'caligrafia-pearl',
          'Herramienta web para explorar y practicar caligrafía digital. Estética minimalista, funcionalidad clara.',
          ['vercel', 'js', 'art'], 'live', 'js')}
      </section>
      <div style={{ padding: '0 48px 12px', color: amber, fontSize: 18, marginTop: -4 }}>{'  ];'}</div>

      {/* Blog */}
      <section style={{ padding: '48px 48px 32px' }}>
        <div style={{ color: sub, fontSize: 11, marginBottom: 6 }}># blog.recientes</div>
        <h2 style={{ margin: '0 0 24px', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>
          <span style={{ color: accent }}>tail</span> <span style={{ color: sub }}>-n 2</span> ./blog
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { tag: 'POST', date: '2026-05-10', title: 'Astro Content Collections: type safety para tu blog', desc: 'defineCollection + z.object() = posts tipados con validación en build time.', meta: ['astro', 'typescript', 'zod'] },
            { tag: 'TIL', date: '2026-05-08', title: 'ImmutableArray vs FrozenSet en .NET 8', desc: 'FrozenSet → read-many-write-never. ImmutableHashSet → safe concurrency + occasional writes.', meta: ['.net', 'c#', 'perf'] }
          ].map((p, i) => (
            <article key={i} style={{
              background: surface, border: `1px solid ${dim}`, padding: 24,
              display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ background: p.tag === 'TIL' ? amber : accent, color: bg, padding: '2px 8px', fontWeight: 600 }}>{p.tag}</span>
                <span style={{ color: sub }}>{p.date}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: ink, lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ margin: 0, color: sub, fontSize: 13, lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                {p.meta.map(m => <span key={m} style={{ color: accent, fontSize: 11 }}>#{m}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 48px 88px', textAlign: 'center' }}>
        <div style={{ color: sub, fontSize: 11, marginBottom: 12 }}># contact.init()</div>
        <h2 style={{
          margin: 0, fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05
        }}>
          <span style={{ color: sub }}>{'>'}</span> ¿<span style={{ color: accent }}>./trabajamos_juntos</span>?
        </h2>
        <p style={{ color: sub, fontSize: 14, marginTop: 16, maxWidth: 600, marginInline: 'auto' }}>
          Abierto a proyectos interesantes, colaboraciones y conversaciones sobre IA, .NET o desarrollo web.
        </p>
        <button style={{
          marginTop: 28, background: accent, color: bg, border: 'none', padding: '16px 28px',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 4
        }}>$ ./contact --now</button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${dim}`, padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: sub, fontSize: 11
      }}>
        <span>© 2026 jesus.dev · built with <span style={{ color: accent }}>astro</span> · deployed on <span style={{ color: accent }}>vercel</span></span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>github</span><span>linkedin</span><span>rss.xml</span>
        </div>
      </footer>
    </div>
  );
}

window.TerminalDesign = TerminalDesign;
