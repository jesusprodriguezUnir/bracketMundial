# 🏆 Bracket Champions 26/27 — Porra de la UEFA Champions League

Una Progressive Web App (PWA) de alto rendimiento diseñada para seguir y predecir los resultados de la UEFA Champions League 2026/27 (formato fase liga de 36 clubes). Construida con enfoque mobile-first, soporte offline completo y estética retro Panini de alta gama.

---

## 🚀 Tecnologías

- **Core**: [Lit](https://lit.dev/) (Web Components ligeros, reactivos y rápidos).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) estricto para un desarrollo tipado y robusto.
- **Estado**: [Zustand](https://github.com/pmndrs/zustand) con persistencia local en `localStorage`.
- **Build Tool**: [Vite](https://vitejs.dev/) con plugins PWA y generación estática SEO.
- **Backend**: [Supabase](https://supabase.com/) (Auth, Mini-Ligas privadas, sync de predicciones y resultados oficiales).
- **Analítica**: [Umami](https://umami.is/) (analítica web privada, sin cookies y respetuosa con el RGPD).
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (Workbox, service workers, cache offline e instalación en escritorio/móvil).
- **Estilos**: Vanilla CSS con variables custom y tokens compartidos (estética retro Panini).

---

## ✨ Características

- **Formato Oficial Fase Liga (36 Clubes)**: Tabla única con 8 jornadas y 144 partidos. Puestos 1-8 avanzan a octavos de final, 9-24 entran al playoff y 25-36 quedan eliminados.
- **Porra de Jornada y Ligas Privadas**: Crea ligas con amigos mediante código corto de invitación (`XXX-XXXX`) o enlace directo `#lg=`, con reglas de puntuación en vivo (5 exacto, 3 diferencia, 2 signo).
- **Cuadro Eliminatorio (Knockout Bracket)**: Simulación de playoffs, octavos, cuartos, semifinales y la gran final en Madrid.
- **Premios Individuales**: Pronóstico de Máximo Goleador y MVP del torneo (+15 puntos extra en ligas).
- **Plantillas y Entrenadores Oficiales**: Fichas completas, alineaciones tácticas (XI tipo) y biografías de los 36 clubes.
- **Exportación Versátil**: Descarga del bracket y calendario en PNG de alta resolución, Excel (.xlsx) y PDF imprimible.
- **Sincronización en Tiempo Real**: Sincronización automática de resultados oficiales con recálculo dinámico de posiciones y clasificaciones.
- **PWA Ready**: Funcional 100% sin conexión y con capacidad de instalación nativa (Android / iOS / Desktop).

---

## 📊 Sistema de Competición 2026/27

1. **Fase Liga**: 36 equipos en tabla única. Cada club disputa 8 partidos (4 local / 4 visitante) a lo largo de 8 jornadas.
2. **Cortes de Clasificación**:
   - **Puestos 1 al 8**: Clasifican directamente a Octavos de Final.
   - **Puestos 9 al 16**: Cabezas de serie para la ronda de Playoffs.
   - **Puestos 17 al 24**: No cabezas de serie para la ronda de Playoffs.
   - **Puestos 25 al 36**: Eliminados de la competición.
3. **Desempates UEFA**: Puntos → Diferencia de goles → Goles a favor → Goles fuera de casa → Victorias → Coeficiente UEFA.
4. **Fase Eliminatoria**: Playoffs de 16 clubes, octavos, cuartos, semifinales y gran final el 5 de junio de 2027 en el Estadio Metropolitano de Madrid.

---

## 🛠️ Configuración Local

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- npm

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jesusprodriguezUnir/bracketMundial.git
   cd bracketMundial
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Configura tus credenciales de Supabase y Umami Analytics (`VITE_UMAMI_WEBSITE_ID`).

### Desarrollo

Inicia el servidor local de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### Tests

Ejecutar la suite de pruebas unitarias con Vitest:
```bash
npm test
```

### Construcción para Producción

Compila el bundle optimizado y genera las páginas estáticas SEO:
```bash
npm run build
```

Previsualiza la versión de producción:
```bash
npm run preview
```

---

## 📂 Estructura del Proyecto

```
├── src/
│   ├── components/         # Web components en Lit (desktop y mobile)
│   ├── data/               # Fixtures, clubes, plantillas y entrenadores (UCL 2026/27)
│   ├── i18n/               # Diccionarios de internacionalización (ES / EN)
│   ├── lib/                # Lógica pura del torneo, ligas, exportación y sync
│   ├── store/              # Zustand stores (torneo, ligas, auth, locale)
│   └── types/              # Definiciones de TypeScript
├── public/                 # Assets estáticos, escudos y páginas SEO pre-renderizadas
├── scripts/                # Scripts de automatización, ingesta y generación estática
└── supabase/               # Esquema de base de datos y migraciones
```

---

Desarrollado con pasión para los amantes del fútbol europeo.
