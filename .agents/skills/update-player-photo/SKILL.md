---
name: update-player-photo
description: >
  Actualiza la foto de un solo jugador del Mundial 2026 a través de la API.
  Úsala cuando el usuario pregunte por: actualizar foto de un jugador,
  cambiar avatar de un jugador específico, re-descargar foto de un jugador,
  foto incorrecta de un jugador, update single player photo, fix player avatar.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: update-player-photo

Actualiza la foto de **un solo jugador** buscándola en las APIs configuradas
(API-Football → TheSportsDB → Wikipedia) y regenera el manifiesto
`player-photos.ts`.

## Cuándo usar esta skill

- El usuario dice que la foto de un jugador es incorrecta o está desactualizada.
- Se necesita re-descargar la foto de un jugador concreto sin tocar el resto del equipo.
- Se acaba de cambiar el dorsal de un jugador en el squad y la foto no coincide.

Para descargar todas las fotos de un equipo completo usa `/player-photos`.

---

## Flujo de trabajo

### 1. Identificar al jugador

Busca en el archivo de squad del equipo (`src/data/squads/{team}.ts`) para
confirmar el **código de equipo** y el **número de dorsal**.

```bash
# Ejemplo: buscar a Martinelli en Brasil
grep -i "martinelli" src/data/squads/bra.ts
# → { number: 20, name: 'Gabriel Martinelli', ... }
```

El equipo es `BRA` y el dorsal es `20`.

### 2. Descargar la foto del jugador

```bash
# Sintaxis corta (solo jugadores, --type player implícito):
npm run photo -- BRA --player 20 --force

# Sintaxis larga equivalente:
npm run photos -- BRA --type player --player 20 --force
```

> **`--force`** es importante: sin él, si ya existe una foto en
> `public/players/BRA/20.webp`, se saltará.

El script:
1. Busca el nombre del jugador `#20` en `src/data/squads/bra.ts`.
2. Consulta las APIs en cascada (API-Football → TheSportsDB → Wikipedia).
3. Descarga, redimensiona a 300px y convierte a WebP.
4. Guarda en `public/players/BRA/20.webp`.
5. Regenera automáticamente `src/data/player-photos.ts`.

### 3. Verificar resultado

```bash
# Confirmar que el archivo existe:
ls public/players/BRA/20.webp

# Confirmar que aparece en el manifiesto:
grep "BRA-20" src/data/player-photos.ts
```

### 4. Validar y construir

```bash
npm run build
```

Si el build pasa, la foto está lista.

---

## Casos especiales

### Jugador no encontrado en ninguna API

Si el script muestra `? #20 Gabriel Martinelli`, ninguna fuente devolvió
resultado con similaridad ≥ 0.6. Opciones:

1. **Buscar manualmente** la URL de una foto del jugador.
2. **Descargar manualmente** y guardar como `public/players/BRA/20.webp`.
3. **Regenerar el manifiesto** tras colocar el archivo:
   ```bash
   npm run photo -- BRA --player 20
   ```
   (sin `--force`; al no encontrar la foto vía API dejará el archivo manual
   intacto y regenerará el manifiesto igualmente).

### Número de dorsal incorrecto

Si el usuario dice que el dorsal cambió, primero actualiza `src/data/squads/{team}.ts`
y luego ejecuta la descarga con el nuevo número.

### Foto descargada pero incorrecta

A veces la API devuelve la foto de un homónimo. En ese caso:

1. Busca la foto correcta en la web.
2. Descárgala manualmente a `public/players/{TEAM}/{n}.webp`.
3. Ejecuta el script **sin** `--force` para regenerar solo el manifiesto.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/fetch-squad-assets.mjs` | Script principal de descarga |
| `src/data/player-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/lib/player-photo.ts` | Helpers `hasPlayerPhoto`, `playerPhotoSrc` |
| `public/players/{TEAM}/{n}.webp` | Foto descargada |
| `src/data/squads/{team}.ts` | Datos del jugador (nombre, dorsal, posición) |

---

## Configuración de API keys (.env)

El script funciona sin keys (TheSportsDB + Wikipedia como fallback), pero con
keys la cobertura mejora para jugadores poco conocidos:

```env
API_FOOTBALL_KEY=tu_rapidapi_key_aqui       # https://rapidapi.com/api-sports/api/api-football
FOOTBALL_DATA_KEY=tu_football_data_key_aqui # https://www.football-data.org/client/register
```

---

## Referencia rápida de comandos

```bash
# Actualizar foto del jugador #7 de Argentina:
npm run photo -- ARG --player 7 --force

# Actualizar foto del jugador #10 de Brasil (forzar re-descarga):
npm run photo -- BRA --player 10 --force

# Ver qué jugadores faltan en un equipo:
npm run assets:report
```
