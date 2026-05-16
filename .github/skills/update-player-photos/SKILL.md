---
name: update-player-photos
description: 'Gestionar fotos de jugadores y entrenadores de bracketMundial. Usa cuando el usuario pida "actualizar fotos", "foto de un jugador", "imágenes que faltan", "foto de entrenador", "reemplazar imagen", "descargar fotos de una selección", "añadir foto" o "foto no aparece". Descarga, convierte y registra imágenes .webp desde TheSportsDB.'
argument-hint: '<operación> <equipo o jugador>'
---

# Gestionar Fotos de Jugadores

## Qué produce

Imágenes `.webp` (300 px de ancho, calidad 80) guardadas en `public/players/{TEAM}/{number}.webp`
y el manifiesto `src/data/player-photos.ts` actualizado con las claves `'{TEAM}-{number}'`.

## Estructura de archivos

```
public/players/
  ESP/
    1.webp   ← número de dorsal del jugador
    7.webp
    ...
src/data/
  squads/esp.ts         ← fuente: number + name de cada jugador
  player-photos.ts      ← AUTOGENERADO, no editar a mano
src/lib/player-photo.ts ← hasPlayerPhoto / playerPhotoSrc
scripts/fetch-player-photos.mjs  ← script principal
```

---

## Casos de uso

### A — Completar fotos de toda una selección

```bash
# Código ISO del equipo en minúsculas (esp, arg, fra…)
node scripts/fetch-player-photos.mjs esp

# Varias selecciones a la vez
node scripts/fetch-player-photos.mjs esp arg fra

# Todas las selecciones (sin argumentos)
node scripts/fetch-player-photos.mjs
```

El script salta los `.webp` que ya existen. Al terminar regenera el manifiesto automáticamente.

---

### B — Añadir foto de un jugador o entrenador concreto

Cuando el script principal no encuentra a un jugador (nombre diferente en la API), usa el patrón del script ad-hoc:

1. Localiza el dorsal del jugador en `src/data/squads/{equipo}.ts`
2. Crea un script temporal (o edita `scratch/fetch-missing.mjs`) con la lista de jugadores:

```js
// scratch/fetch-missing.mjs  (patrón ya existente)
const missing = [
  { team: 'ESP', number: 7, name: 'Morata' },
  { team: 'ESP', number: 9, name: 'Joselu' },
];
```

3. Ejecuta:

```bash
node scratch/fetch-missing.mjs
```

4. Regenera el manifiesto:

```bash
node scripts/fetch-player-photos.mjs --dry-run-manifest
# Si no existe ese flag, ejecuta cualquier selección con fotos ya descargadas:
node scripts/fetch-player-photos.mjs esp
```

> **Entrenadores**: no tienen dorsal oficial. Asígnale el número `0` en el squad file y úsalo en `fetch-missing.mjs`. El manifiesto registrará la clave `'ESP-0'`.

---

### C — Reemplazar una imagen existente

El script principal **salta** archivos ya existentes. Para forzar la re-descarga:

```bash
# Borra el archivo a reemplazar
Remove-Item public/players/ESP/7.webp

# Vuelve a ejecutar para esa selección
node scripts/fetch-player-photos.mjs esp
```

O sustituye manualmente el `.webp` (imagen ya en formato correcto):

```bash
# Convierte cualquier imagen externa y deposítala en su lugar
node -e "
import('sharp').then(({default:s})=>
  s('ruta/imagen.jpg')
    .resize(300, null, {withoutEnlargement:true})
    .webp({quality:80})
    .toFile('public/players/ESP/7.webp')
    .then(()=>console.log('OK'))
);"
```

---

### D — Regenerar solo el manifiesto (sin descargar nada)

Ejecuta el script con una selección cuyos archivos ya existen todos (el script salta la descarga y al final regenera el manifiesto):

```bash
node scripts/fetch-player-photos.mjs esp
```

El manifiesto resultante queda en `src/data/player-photos.ts`.

---

## Flujo completo tras añadir/reemplazar fotos

```
1. node scripts/fetch-player-photos.mjs [equipo]
2. Verificar salida: ✓ descargadas · ❌ sin foto · ⚠ errores
3. src/data/player-photos.ts regenerado automáticamente
4. npm run build   ← valida TypeScript
5. git add public/players/ src/data/player-photos.ts
6. git commit -m "chore: update player photos [TEAM]"
7. git push
```

---

## Diagnóstico rápido

| Síntoma | Causa | Solución |
|---|---|---|
| `❌ sin foto` para un jugador | Nombre distinto en TheSportsDB | Busca el nombre exacto en `https://www.thesportsdb.com` y úsalo en `fetch-missing.mjs` |
| Foto no aparece en la app | No está en `player-photos.ts` | Re-ejecuta el script para que regenere el manifiesto |
| `API HTTP 429` | Rate limit TheSportsDB | Espera y reintenta; la API gratuita es `/json/3` |
| Imagen se ve cortada/distorsionada | Proporción original inusual | Sustituye manualmente con la opción C |
| `sharp` no encontrado | Falta instalar deps | `npm install` |

## API usada

- **TheSportsDB** free tier: `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p={nombre}`
- Devuelve `strCutout` (recorte sin fondo, preferido) o `strThumb`
- Throttle interno: 3 s entre peticiones
