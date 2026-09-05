---
name: instagram-reel
description: >
  Graba un reel vertical 1080×1920 (9:16) de una vista o equipo concreto de la app,
  con texto Panini retro quemado en el video, caption y hashtags sugeridos.
  Compatible al 100% con Instagram Reels, TikTok y YouTube Shorts. Úsala cuando
  el usuario pida: grabar un reel, reel de instagram, video para tiktok de una sección,
  video vertical de una vista, reel de favoritos, demo de un club/equipo.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: instagram-reel

Graba un **reel vertical 1080×1920 (9:16)** enfocado en **una sección o equipo específico** de la web (en lugar de un recorrido general por toda la app). Permite incrustar titulares en tipografía retro Panini quemados directamente en el video y genera un archivo `.caption.txt` con el texto de publicación y hashtags listo para copiar y pegar.

El formato generado (MP4 H.264 vertical 9:16) es el estándar universal para:
- **Instagram Reels** y **Stories**
- **TikTok**
- **YouTube Shorts**

---

## Flujo de trabajo

### 1. Consultar las vistas disponibles

```bash
npm run reel list
```

**Vistas disponibles y alias admitidos:**

| Clave | Alias en español | Descripción |
|-------|------------------|-------------|
| `hero` | `inicio`, `home` | Portada, cuenta atrás y últimas noticias |
| `groups` | `grupos`, `tabla`, `table` | Clasificación general (tabla de 36 UEFA o grupos) |
| `matchday` | `jornadas`, `jornada`, `partidos` | Fixtures y predicciones jornada a jornada |
| `squads` | `equipos`, `clubes`, `plantillas` | Cartas de jugadores, alineaciones y dorsales |
| `league` | `liga`, `porra`, `miniliga` | Mini-ligas privadas y tabla de clasificación |
| `calendar` | `calendario`, `schedule` | Calendario completo con horarios y sedes |
| `coaches` | `entrenadores`, `dt` | Fichas técnicas de directores técnicos |
| `knockout` | `cruces`, `eliminatorias` | Cuadro de eliminatorias y bracket |
| `stadiums` | `estadios` | Fichas de sedes y recintos deportivos |
| `guide` | `guia` | Guía táctica completa y onces titulares |

---

### 2. Ejemplos de uso comunes

#### A) Reel de una jornada de Champions League con título quemado
```bash
npm run reel -- jornadas --text "Jornada 1 Champions League\n¿Quién se lleva los 3 puntos?"
```

#### B) Reel de la tabla de clasificación (en inglés y tema oscuro)
```bash
npm run reel -- tabla --lang en --theme dark --text "UEFA League Phase Standings"
```

#### C) Reel enfocado en la plantilla de un club o selección concreta
Permite abrir automáticamente la ficha del equipo y fijar un CTA final:
```bash
# Ejemplo para un club de Champions:
npm run reel -- squads --team "Real Madrid" --text "Plantilla Oficial UCL" --end-text "Arma tu porra gratis"

# Ejemplo para una selección:
npm run reel -- squads --team "España" --text "Convocatoria Oficial" --end-text "bracketmundial.com"
```

#### D) Reel de Mini-Ligas entre amigos
```bash
npm run reel -- liga --text "Crea tu liga privada gratis\ny compite con tus amigos"
```

#### E) Reel de favoritos y estrellas del fútbol (Edición Especial)
Compila escenas dinámicas y jugadas destacadas de los máximos favoritos:
```bash
npm run reel:favorites
```

---

## Opciones y banderas

| Argumento | Valores | Por defecto | Descripción |
|-----------|---------|-------------|-------------|
| `<vista>` | Clave de vista o alias | — *(Obligatorio)* | Sección que se grabará |
| `--text` | Texto libre (`\n` para salto) | `null` | Banner superior/inferior con tipografía Panini |
| `--end-text` | Texto libre | `null` | Banner de llamada a la acción en los últimos segundos |
| `--team` | Nombre exacto del equipo | `null` | Abre y enfoca la tarjeta del club o selección |
| `--duration` | Segundos | `20` | Duración total de la grabación (15–30s recomendados) |
| `--lang` | `es` \| `en` | `es` | Idioma de la interfaz |
| `--theme` | `light` \| `dark` | `light` | Modo claro u oscuro |

---

## Archivos de salida

Al concluir la ejecución, el script genera en la carpeta `recordings/`:

1. **`reel-<vista>-<lang>.mp4`**: Video en resolución `1080×1920` (9:16), 25/30 FPS, codificado en H.264, listo para subir a Instagram Reels, TikTok o YouTube Shorts.
2. **`reel-<vista>-<lang>.caption.txt`**: Copy sugerido optimizado con gancho, llamado a la acción (CTA) y hashtags de alto impacto (`#ChampionsLeague #UCL #Mundial2026 #Futbol #BracketNights`).

---

## Cómo funciona el banner de texto integrado

El parámetro `--text` inyecta un componente visual con la tipografía oficial del proyecto (`Bowlby One` / `Archivo Black`), paleta retro Panini (naranja característico, borde negro y sombra dura con offset).

- **No modifica el código fuente de la app**: se inyecta dinámicamente en tiempo de ejecución vía el Shadow DOM de Playwright.
- **Queda quemado en el archivo MP4**: no depende de que la red social muestre bien las etiquetas de texto, asegurando máxima legibilidad.

---

## Requisitos y dependencias

- Requiere `ffmpeg` instalado en el sistema y disponible en el `PATH`.
- El script gestiona el ciclo de vida del servidor de desarrollo local de forma autónoma; no requiere tener `npm run dev` corriendo previamente.
