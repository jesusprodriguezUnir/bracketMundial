---
name: x-post
description: >
  Genera el contenido visual y textual optimizado para publicaciones en X (Twitter):
  captura de alta resolución (16:9 horizontal o 1:1 cuadrada) con banner opcional
  más copy de tweet (≤280 caracteres) con hashtags y enlace web. Úsala cuando el
  usuario pida: crear un post en X, post para Twitter, tweet de una sección,
  imagen para tweet, hilo para X, post de jornada de Champions o Mundial.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: x-post

Genera todo el material necesario para publicar en **X (Twitter)** sobre cualquier sección, jornada o equipo de la aplicación:
1. Una **imagen de alta resolución** ajustada a la proporción perfecta para el feed de X (`16:9` panorámica o `1:1` cuadrada móvil).
2. Un **texto de tweet (≤280 caracteres)** con gancho, enlace a la web y hashtags relevantes.

> **Nota de publicación**: El script no utiliza la API de X; produce los archivos finales listos para componer el post manualmente o programarlo en cualquier gestor de redes sociales (TweetDeck, Buffer, Hootsuite, etc.).

---

## Flujo de trabajo

### 1. Ver qué vistas y secciones se pueden capturar

```bash
npm run x:post list
```

**Vistas y alias admitidos:**

| Clave canónica | Alias en español | Contenido capturado |
|----------------|------------------|---------------------|
| `matchday` | `jornadas`, `jornada`, `partidos` | Fixture de la jornada de Champions / Mundial con cuotas y horarios |
| `groups` | `grupos`, `tabla`, `table` | Tabla general de 36 equipos UEFA o grupos del Mundial |
| `squads` | `equipos`, `clubes`, `plantillas` | Cartas oficiales de jugadores, dorsales y alineaciones |
| `league` | `liga`, `porra`, `miniliga` | Panel de mini-ligas privadas y ranking de amigos |
| `calendar` | `calendario`, `schedule` | Calendario completo con horarios y sedes |
| `coaches` | `entrenadores`, `dt` | Fichas de entrenadores y directores técnicos |
| `hero` | `inicio`, `home` | Portada, cuenta atrás y destacados |
| `knockout` | `cruces`, `eliminatorias` | Cuadro eliminatorio y bracket de predicciones |
| `stadiums` | `estadios` | Fichas de estadios y sedes |
| `guide` | `guia` | Guía táctica y onces titulares |

---

### 2. Comandos y ejemplos de generación

#### A) Post de una Jornada de Champions League (16:9 panorámico)
```bash
npm run x:post -- jornadas --ratio 16:9 --text "Jornada 1 · Champions League"
```

#### B) Post de la Tabla de Clasificación en formato cuadrado (1:1 óptimo para móviles)
```bash
npm run x:post -- tabla --ratio 1:1 --text "Clasificación General UEFA"
```

#### C) Post en inglés con tema oscuro (Dark Mode)
```bash
npm run x:post -- matchday --lang en --theme dark --text "Predict this matchday!"
```

#### D) Post de Mini-Ligas para captar usuarios
```bash
npm run x:post -- liga --text "Crea tu porra gratis con amigos" --ratio 16:9
```

---

## Opciones y argumentos

| Argumento | Valores | Por defecto | Descripción |
|-----------|---------|-------------|-------------|
| `<vista>` | Clave de vista o alias | — *(Obligatorio)* | Vista que se capturará |
| `--text` | Texto libre | `null` | Banner Panini retro quemado sobre la imagen |
| `--ratio` | `16:9` \| `1:1` | `16:9` | Relación de aspecto de la imagen |
| `--lang` | `es` \| `en` | `es` | Idioma de la interfaz (`es` o `en`) |
| `--theme` | `light` \| `dark` | `light` | Modo visual de la captura |

---

## Archivos generados

El script guarda los resultados en la carpeta `marketing/x/`:

- **`x-<vista>.png`**: Imagen optimizada mediante `sharp` (`1600×900` para `16:9` o `1080×1080` para `1:1`).
- **`x-<vista>.txt`**: Texto del tweet ajustado estrictamente a ≤280 caracteres, respetando palabras completas, con la URL de la app y hashtags optimizados (`#ChampionsLeague #UCL #Mundial2026 #Porra #BracketNights`).

---

## Estrategias avanzadas para publicaciones en X

### Publicar un carrusel de hasta 4 imágenes
X permite adjuntar hasta **4 imágenes** en un solo tweet:
1. Ejecuta el comando para las vistas que desees combinar:
   ```bash
   npm run x:post -- jornadas --ratio 1:1
   npm run x:post -- tabla --ratio 1:1
   npm run x:post -- equipos --ratio 1:1
   npm run x:post -- liga --ratio 1:1
   ```
2. En el compositor de X, pega el texto de `marketing/x/x-jornadas.txt` y adjunta los 4 PNGs generados en `marketing/x/`.

### Publicación en tiempo real / Días de partido
Combina las capturas de `x:post` con las fuentes de datos vivas de la app:
- **Cuotas 1X2**: Ejecuta `npm run odds` para actualizar las probabilidades del modelo.
- **Noticias frescas**: Ejecuta `npm run news` para disponer de los titulares más recientes del club o selección.
- Usa el banner `--text` para destacar el partido estrella (ej: `--text "Real Madrid vs Manchester City · Pronostica gratis"`).

---

## Aspectos técnicos

- **Playwright** navega limpiamente despachando el evento custom `navigate` en el Shadow DOM de la app, siendo totalmente independiente del idioma activo.
- **Sin dependencias de API externa**: No requiere tokens ni credenciales de desarrollador de X.
- **Servidor automático**: Inicia y apaga el entorno de desarrollo local automáticamente.
