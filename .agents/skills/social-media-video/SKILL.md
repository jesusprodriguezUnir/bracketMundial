---
name: social-media-video
description: >
  Graba y produce videos de la app optimizados para publicaciones en
  Instagram (Reels/Stories 9:16), TikTok (9:16 vertical), Facebook (1:1 feed)
  y Twitter/X (16:9 horizontal). Úsala cuando el usuario pida: video para redes,
  video para tiktok, video para instagram, video para facebook, video para x,
  video promocional, batch de videos para redes, demo en video de la app.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: social-media-video

Graba **videos demo y promocionales** de la aplicación optimizados nativamente para cada red social (**Instagram**, **TikTok**, **Facebook**, **Twitter / X**), con soporte tanto para la **UEFA Champions League** (Bracket Nights) como para el **Mundial 2026**.

Playwright ejecuta la navegación real sobre la interfaz (despachando eventos de navegación limpios y simulando interacciones fluidas con *smooth scroll*), y `ffmpeg` procesa y recorta el video en el formato, resolución y proporción exacta de cada plataforma.

---

## Plataformas y especificaciones técnicas

| Plataforma | Resolución | Relación de aspecto | Formato | Duración óptima | Enfoque de contenido |
|------------|------------|---------------------|---------|-----------------|----------------------|
| **TikTok** | `1080×1920` | `9:16` (Vertical) | MP4 H.264 | 15–20 s | Ritmo dinámico, gancho en los primeros 3s, interactividad |
| **Instagram** | `1080×1920` | `9:16` (Reels / Stories) | MP4 H.264 | 15–30 s | Visual estético retro Panini, stickers/encuestas, debate |
| **Facebook** | `1080×1080` | `1:1` (Cuadrado) | MP4 H.264 | 15–30 s | Feed móvil/desktop sin cortes, debate en comentarios |
| **Twitter / X** | `1920×1080` | `16:9` (Horizontal) | MP4 H.264 | 10–15 s | Autoplay directo en timeline, llamada a la acción hacia link |

---

## Comandos disponibles

### 1. Grabar para una sola plataforma

```bash
# Formato por defecto (Instagram 1080×1920, 30s):
npm run video

# Grabar para TikTok (9:16, 15 segundos recomendados):
npm run video -- tiktok 15

# Grabar para Instagram Reels (9:16, 20 segundos):
npm run video -- instagram 20

# Grabar para Facebook Feed (1:1 cuadrado, 20 segundos):
npm run video -- facebook 20

# Grabar para Twitter / X (16:9 horizontal, 12 segundos):
npm run video -- twitter 12
```

### 2. Generar el paquete completo para TODAS las redes de una vez

Arranca el servidor Vite de desarrollo **una única vez** y genera los 4 formatos secuencialmente en lote:

```bash
# Grabar para Instagram, TikTok, Facebook y Twitter/X (~15s por video):
npm run video:all -- 15

# Con duración por defecto (~30s por video):
npm run video:all
```

Al finalizar, genera un resumen en consola y los videos en `recordings/`:
- `recordings/demo-tiktok.mp4`
- `recordings/demo-instagram.mp4`
- `recordings/demo-facebook.mp4`
- `recordings/demo-twitter.mp4`

### 3. Videos de interacción especializada

Además del recorrido general de vistas, existen generadores específicos para mecánicas clave del producto:

```bash
# Simulación en vivo de pronósticos y cálculo de puntos (16:9 horizontal):
npm run video:simulation

# Creación de Mini-Ligas privadas y competición entre amigos (9:16 vertical con música):
npm run video:leagues

# Grabación libre interactiva guiada por el usuario:
npm run record:session
```

---

## Rutina de navegación automática

El script recorre fluidamente los puntos clave de la app:
1. **Inicio (Hero)**: Cuenta atrás, banner del torneo y noticias destacadas con scroll suave.
2. **Clasificación (Tabla / Grupos)**: Tabla general de 36 equipos UEFA o grupos del Mundial.
3. **Jornadas (Matchday) / Cruces (Knockout)**: Partidos fecha a fecha o cuadro eliminatorio.
4. **Plantillas (Squads)**: Cromos oficiales de jugadores y fichas técnicas.
5. **Calendario (Schedule)**: Fixture completo ordenado por fecha y sede.
6. **Ligas Sociales (League)**: Creación de porras privadas y tabla de participantes.
7. **Entrenadores (Coaches)**: Directores técnicos y estrategas.
8. **Cierre**: Retorno a la cabecera principal.

---

## Guía de publicación y copys recomendados

### Para TikTok
- **Texto en video / Portada**: "La app definitiva para pronosticar la Champions / Mundial 🔥⚽"
- **Copy sugerido**:
  > ¿Quién clasifica al Top 8 directo y quién va a playoffs? Arma tus pronósticos gratis en bracketmundial.com y desafía a tus amigos. Link en bio! 🏆
- **Hashtags**: `#UCL #ChampionsLeague #Futbol #TikTokDeportes #Porra #Mundial2026 #Bracket`

### Para Instagram (Reels)
- **Audio**: Usar un audio en tendencia de fútbol o ritmo enérgico dentro del editor de Reels.
- **Copy sugerido**:
  > ⚽ ¿Te animas a predecir todos los resultados de la jornada? Crea tu mini-liga privada y compite con tu grupo de amigos sin registro ni anuncios invasivos.
  > 👉 Pruébalo en el link de nuestro perfil.
- **Hashtags**: `#ChampionsLeague #UCL #BracketNights #Mundial2026 #Quiniela #FutbolRetro #ReelsFutbol`

### Para Facebook
- **Copy sugerido**:
  > 🏆 Ya está disponible el simulador oficial de jornadas y clasificación. Predice cada partido, revisa las plantillas completas y comparte tu porra con amigos.
  > 🔗 Entra gratis aquí: bracketmundial.com
- **Hashtags**: `#ChampionsLeague #FutbolInternacional #Mundial2026 #PronosticosDeportivos`

### Para Twitter / X
- **Copy sugerido** (≤280 caracteres):
  > ⚽ Sigue la Champions League jornada a jornada: fixtures, plantillas oficiales y simulador de clasificación en tiempo real.
  > 
  > 🎯 Crea tu mini-liga y compite con amigos: https://bracketmundial.com
  > 
  > #UCL #ChampionsLeague #BracketNights
- **Media**: Adjunta `recordings/demo-twitter.mp4` directamente al componer el tweet.

---

## Requisitos del sistema

- **Playwright** con Chromium instalado (`npx playwright install chromium`).
- **ffmpeg** disponible en el `PATH` del sistema (usado para convertir el flujo `.webm` crudo a `.mp4` con codificación H.264/AAC universal).