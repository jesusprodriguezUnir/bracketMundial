---
name: photos-from-image
description: >
  Extrae fotos de jugadores y/o entrenador desde una imagen (post de Instagram,
  captura de lineup, infografía, etc.) y las guarda como avatares de la app.
  Úsala cuando el usuario pegue una imagen o URL de IG y diga: "saca las caras
  de estos jugadores", "extrae los avatares de este lineup", "recorta los
  jugadores de esta foto para SWE", "convierte este post en fotos de jugadores",
  "rellena huecos de JOR con esta captura".
---

# Skill: photos-from-image

Convierte una imagen del lineup (post de IG, captura, infografía) en fotos
individuales de jugadores recortadas a `public/players/{TEAM}/{n}.webp` y/o de
entrenador a `public/coaches/{TEAM}.webp`. Tú (Claude) analizas la imagen
visualmente, propones bboxes + dorsales, y un script Node se encarga del
recorte con `sharp`.

---

## Flujo de trabajo

### 1. Confirmar el equipo

Pregúntale al usuario el código de 3 letras del equipo (ej. `SWE`, `JOR`,
`CPV`). Si la imagen lo indica claramente (bandera, nombre del país, escudo),
propón el código y pide confirmación en lugar de preguntar a ciegas.

### 2. Obtener la imagen como archivo local

- **Si el usuario pegó la captura al chat:** ya tienes acceso a la ruta del
  temp file. Úsala directamente. Suele ser algo tipo
  `C:\Users\...\AppData\Local\Temp\...\image.png`.
- **Si dio una URL de Instagram:** descarga la imagen primero. IG suele
  bloquear el HTML público para no-logueados; el flujo robusto es pedirle al
  usuario que abra el post, haga click derecho → "Guardar imagen como" y
  pegue la ruta o la propia imagen al chat. Si insiste con la URL, intenta
  `WebFetch` sobre la URL del post buscando el meta `og:image` y descarga ese
  jpg con un script Node corto.

### 3. Leer la plantilla del equipo

Lee `src/data/squads/{team-lowercase}.ts` (ej. `src/data/squads/swe.ts`) para
ver la lista de jugadores con `number` y `name`. Esta es la fuente de verdad
para asignar dorsales.

### 4. Analizar la imagen y construir el spec

Examina la imagen visualmente. Para cada cara que veas:

1. Lee el **apellido** que aparece debajo de la cara (o cerca de ella).
2. **Asigna el dorsal**: busca en el squad un jugador cuyo apellido coincida.
   Casos típicos en lineups:
   - "ISAK" → Alexander Isak → `number: 9`
   - "GYÖKERES" → Viktor Gyökeres → `number: 17`
   - "E. HOLM" → Emil Holm → `number: 6`
3. **Estima el bbox** `[x, y, w, h]` en proporciones 0..1 sobre la imagen
   completa. El bbox debe cubrir **solo la cara**, no el cuerpo entero ni la
   etiqueta del nombre. El script aplicará un padding de 15% automáticamente,
   así que no infles tú el rectángulo.

**Cómo estimar coordenadas con precisión razonable:**

- Si el lineup está en una formación regular (4-3-3, 4-4-2…), las caras suelen
  estar en filas horizontales. Asigna a cada fila una franja `y` similar y
  varía solo `x`.
- Usa la imagen entera como referencia 0..1. El origen es la esquina
  superior-izquierda.
- Una cara típica en un lineup de cuerpo completo ocupa ~10–15% de ancho y
  ~12–18% de alto.
- Si dudas entre dos posiciones, prefiere un bbox **un poco más pequeño** y
  centrado en los ojos — el padding del script lo compensa.

Para el entrenador (si aparece en la imagen, normalmente abajo o en una
esquina): usa `type: "coach"` sin `number`.

### 5. Construir el JSON del spec

Genera un archivo temporal con el spec (formato exacto que espera el script):

```json
{
  "items": [
    { "type": "player", "number": 9,  "bbox": [0.18, 0.18, 0.14, 0.16], "label": "ISAK" },
    { "type": "player", "number": 17, "bbox": [0.43, 0.18, 0.14, 0.16], "label": "GYÖKERES" },
    { "type": "player", "number": 7,  "bbox": [0.68, 0.18, 0.14, 0.16], "label": "BERGVALL" },
    { "type": "coach",                 "bbox": [0.42, 0.86, 0.16, 0.12], "label": "Coach" }
  ]
}
```

Escríbelo a una ruta temporal, p.ej. `d:/tmp/extract-SWE.json`.

### 6. Vista previa (recomendado en la primera pasada)

Antes de escribir definitivamente, ejecuta con `--dry-run` para ver el listado
de recortes sin tocar disco ni manifiesto:

```bash
npm run photos:extract -- --team SWE --image "C:/.../sweden-lineup.png" --spec d:/tmp/extract-SWE.json --dry-run
```

Si el listado se ve correcto, lanza la versión real. Si dudas de algún recorte
en particular, lánzalo solo y muéstrale al usuario el `.webp` resultante con
`Read` antes de seguir con el resto.

### 7. Ejecutar el recorte real

```bash
# Crear los archivos que no existan:
npm run photos:extract -- --team SWE --image "C:/.../sweden-lineup.png" --spec d:/tmp/extract-SWE.json

# Forzar sobre-escritura de los que ya existen:
npm run photos:extract -- --team SWE --image "C:/.../sweden-lineup.png" --spec d:/tmp/extract-SWE.json --force

# Ajustar el padding (default 15%) si las caras quedan muy apretadas:
npm run photos:extract -- --team SWE --image "..." --spec ... --pad 0.25
```

El script:

- Recorta cada bbox (expandido por `--pad`) con `sharp`.
- Redimensiona a 300px de ancho máx., guarda como `.webp` calidad 85.
- Guarda jugadores en `public/players/{TEAM}/{n}.webp`.
- Guarda entrenador (si hay) en `public/coaches/{TEAM}.webp`.
- Regenera `src/data/player-photos.ts` y `src/data/coach-photos.ts`.

### 8. Verificar resultado

Muéstrale al usuario 2–3 de los `.webp` recortados (los más importantes, p.ej.
el capitán) usando la herramienta `Read` para que confirme la calidad.

Si algún recorte salió mal (cabeza cortada, cara descentrada), edita el spec
solo para esos items y vuelve a ejecutar con `--force`.

Finalmente:

```bash
npm run build
```

Si pasa, reporta al usuario:

- Cuántos jugadores se añadieron.
- Si se actualizó el coach.
- Equipo y total de cobertura nueva (mirando el reporte de
  `npm run assets:report` si tiene sentido).

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/extract-from-image.mjs` | Script que recorta con `sharp` |
| `src/data/squads/{team}.ts` | Fuente de verdad para dorsales/nombres |
| `src/data/player-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/data/coach-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `public/players/{TEAM}/{n}.webp` | Destino de las fotos de jugador |
| `public/coaches/{TEAM}.webp` | Destino de la foto del entrenador |

---

## Notas

- Esta skill **solo recorta**; no descarga de APIs. Para fotos individuales de
  fuentes oficiales usa `/player-photos` o `/coach-photos`.
- Es perfecta para selecciones con poca cobertura en APIs (CPV, HAI, KSA, JOR,
  CUW, IRQ…), donde un buen post de IG o gráfico de prensa rellena 11+ huecos
  en una sola pasada.
- Si la imagen es de mala calidad o las caras son muy pequeñas, avisa al
  usuario antes de procesar — el output a 300px puede quedar borroso.
- El padding default (15%) está calibrado para caras frontales recortadas a la
  altura del pecho. Para infografías muy ajustadas usa `--pad 0` o `--pad 0.05`.
- Respeta derechos de imagen: usa este flujo solo con contenido cuyo uso esté
  permitido para tu app.
