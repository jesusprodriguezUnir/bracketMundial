---
name: odds
description: >
  Actualiza el feed de cuotas 1X2 del Mundial 2026 y lo publica en la app.
  Úsala cuando el usuario pregunte por: actualizar cuotas, refrescar odds de
  un partido, publicar feed de cuotas, regenerar seed de odds, cuotas de casas
  de apuestas, probabilidades 1X2, update odds, odds seed, simulación realista.
---

# Skill: odds

Actualiza las cuotas 1X2 (gana A / empate / gana B) desde The Odds API,
completa los partidos sin odds de mercado con estimaciones del modelo Elo,
regenera el `seed.ts` bundleado y publica la rama huérfana `odds-data` para
que la app en producción lo consuma.

## Flujo de trabajo

### 1. Generar el feed

```bash
# Sin ODDS_API_KEY: genera todos los 72 partidos con estimaciones del modelo
npx tsx scripts/generate-odds.mjs

# Con ODDS_API_KEY (requiere .env): mezcla odds reales + modelo para las restantes
npx tsx scripts/generate-odds.mjs
```

El script:
- Si hay `ODDS_API_KEY` en `.env`, llama a The Odds API y toma odds reales de los
  partidos disponibles (`source:'market'`).
- Para los partidos sin odds de mercado (habitual hasta días antes de junio 2026),
  calcula probabilidades con el modelo Elo (`src/data/team-strength.ts` +
  `src/lib/odds-model.ts`) y los marca como `source:'model'`.
- Siempre genera los 72 partidos de fase de grupos.

### 2. Regenerar el seed bundleado (fallback offline)

```bash
npx tsx scripts/generate-odds.mjs --write-seed
```

Esto regenera `src/data/odds/seed.ts` con los 72 partidos del feed. El seed se
incluye en el bundle y es el fallback cuando el fetch externo falla o está vacío.

**Importante**: committer el seed actualizado a `main` para que el fallback de la
app sea el más reciente.

```bash
git add src/data/odds/seed.ts odds-feed.json
git commit -m "chore: update odds seed $(Get-Date -Format 'yyyy-MM-dd')"
```

### 3. Publicar la rama `odds-data` (refleja cambios en la app en vivo)

La app en producción lee el feed desde:
`https://raw.githubusercontent.com/jesusprodriguezUnir/bracketMundial/odds-data/odds-feed.json`

Para publicarlo se replica lo que hace el cron de GitHub Actions.
**Confirmar con el usuario antes de ejecutar el push — es una operación de force push.**

Verificar primero que el árbol de trabajo esté limpio:

```bash
git status
```

Si hay cambios sin commitear, abortar y pedirle al usuario que los gestione primero.

Cuando el árbol está limpio, ejecutar **en secuencia** (PowerShell):

```powershell
# 1. Guardar el feed generado fuera del árbol git
Copy-Item odds-feed.json $env:TEMP\odds-feed.json

# 2. Crear rama huérfana temporal
git checkout --orphan odds-data-tmp

# 3. Limpiar árbol de trabajo
git rm -rf . --quiet

# 4. Copiar solo los archivos necesarios
Copy-Item $env:TEMP\odds-feed.json odds-feed.json

# Crear vercel.json válido para evitar instalar dependencias y compilar en la rama estática:
# En Bash:
cat > vercel.json <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "echo 'No install step for odds-data'",
  "buildCommand": "echo 'No build step for odds-data'",
  "outputDirectory": "."
}
EOF

# En PowerShell:
@'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "echo 'No install step for odds-data'",
  "buildCommand": "echo 'No build step for odds-data'",
  "outputDirectory": "."
}
'@ | Out-File -Encoding utf8 vercel.json

# 5. Commitear
git add odds-feed.json vercel.json
git commit -m "chore: update odds feed $(Get-Date -Format 'yyyy-MM-dd')"

# 6. Force-push a odds-data (CONFIRMAR antes)
git push origin odds-data-tmp:odds-data --force

# 7. Volver a main
git checkout main
git branch -D odds-data-tmp
```

### 4. Verificar publicación

```bash
git show origin/odds-data:odds-feed.json | head -5
```

Debe mostrar la fecha actual en `updatedAt` y los 72 partidos.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-odds.mjs` | Script principal de generación |
| `src/data/team-strength.ts` | Ratings Elo de los 48 equipos (base del modelo) |
| `src/lib/odds-model.ts` | Modelo de probabilidad 1X2 + sampleResult para simulación |
| `odds-feed.json` | Feed generado (no se commitea a main, solo a odds-data) |
| `src/data/odds/seed.ts` | Fallback bundleado (regenerar con --write-seed) |
| `src/lib/odds-service.ts` | Servicio runtime: fetch externo → cache 6h → seed |
| `.github/workflows/odds.yml` | Cron 2×/día que hace lo mismo automáticamente |

---

## Notas

- El cron de GitHub Actions (`odds.yml`) ejecuta este flujo dos veces al día
  (06:00 y 18:00 UTC). Esta skill sirve para actualizaciones manuales.
- Las cuotas de mercado solo aparecen días antes de cada partido (junio 2026).
  Hasta entonces, todos los partidos usan estimaciones del modelo.
- La simulación del torneo (`autoSimulateGroups` / `autoSimulateKnockout`)
  usa las cuotas del seed de forma síncrona; los favoritos del modelo ganan
  con más frecuencia que el azar uniforme anterior.
- La app cachea el feed en localStorage con TTL de 6 h (clave `odds:feed:v2`).
  Tras publicar, el usuario necesita hacer un **hard reload** (Ctrl+Shift+R)
  o esperar a que expire el cache para ver los cambios.
- Secreto GitHub: `ODDS_API_KEY` → Settings → Secrets → Actions.
  Plan free de The Odds API: ~500 req/mes ≈ 60 req/mes con el cron actual.
