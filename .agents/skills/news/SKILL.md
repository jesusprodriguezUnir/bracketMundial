---
name: news
description: >
  Actualiza el feed de noticias del Mundial 2026 y lo publica en la app.
  Úsala cuando el usuario pregunte por: actualizar noticias, refrescar
  noticias de un equipo, publicar feed de noticias, noticias desactualizadas,
  news feed, update news, regenerar seed de noticias.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: news

Actualiza las noticias de uno o todos los equipos desde Google News, regenera
el `seed.ts` bundleado y publica la rama huérfana `news-data` para que la app
en producción lo consuma.

## Flujo de trabajo

### 1. Generar el feed

```bash
# Todos los equipos (los 48):
node scripts/generate-news.mjs

# Equipos específicos (preserva los demás en el JSON existente):
node scripts/generate-news.mjs ARG ESP BRA
```

El script muestra el conteo `es:/en:` por equipo. Utiliza un retardo de
300 ms entre peticiones para no sobrecargar Google News.

### 2. Regenerar el seed bundleado (fallback offline)

```bash
# Todos los equipos:
node scripts/generate-news.mjs --write-seed

# Equipos específicos + seed:
node scripts/generate-news.mjs ARG ESP --write-seed
```

Esto regenera `src/data/news/seed.ts` con las noticias obtenidas. El seed
se incluye en el bundle y es el fallback cuando el fetch externo falla.

### 3. Publicar la rama `news-data` (refleja cambios en la app en vivo)

La app en producción lee el feed desde:
`https://raw.githubusercontent.com/jesusprodriguezUnir/bracketMundial/news-data/news-feed.json`

Para publicarlo se replica lo que hace el cron de GitHub Actions. **Confirmar
con el usuario antes de ejecutar el push — es una operación de force push
sobre una rama remota.**

Verificar primero que el árbol de trabajo esté limpio:

```bash
git status
```

Si hay cambios sin commitear en ramas/archivos ajenos al news feed, abortar y
pedirle al usuario que los gestione primero.

Cuando el árbol está limpio, ejecutar **en secuencia**:

```bash
# 1. Guardar el feed generado fuera del árbol git
cp news-feed.json /tmp/news-feed.json   # PowerShell: Copy-Item news-feed.json $env:TEMP\news-feed.json

# 2. Crear rama huérfana temporal
git checkout --orphan news-data-tmp

# 3. Limpiar árbol de trabajo
git rm -rf . --quiet

# 4. Copiar solo los archivos necesarios
cp /tmp/news-feed.json news-feed.json   # PowerShell: Copy-Item $env:TEMP\news-feed.json news-feed.json
echo '{"ignoreCommand":"exit 0"}' > vercel.json

# 5. Commitear
git add news-feed.json vercel.json
git commit -m "chore: update news feed $(date -u +%Y-%m-%d)"   # PowerShell: "chore: update news feed $(Get-Date -Format 'yyyy-MM-dd' -AsUTC)"

# 6. Force-push a news-data (CONFIRMAR antes)
git push origin news-data-tmp:news-data --force

# 7. Volver a main
git checkout main
git branch -D news-data-tmp
```

**Nota PowerShell:** adaptar los comandos de copia y fecha al entorno del
usuario (Windows/PowerShell vs Linux/bash).

### 4. Verificar publicación

```bash
git show origin/news-data:news-feed.json | head -5
```

Debe mostrar la fecha de hoy en `updatedAt`.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-news.mjs` | Script principal de generación |
| `news-feed.json` | Feed generado (en rama main — no se commitea, solo se publica en news-data) |
| `src/data/news/seed.ts` | Fallback bundleado (regenerar con `--write-seed`) |
| `src/lib/news-service.ts` | Servicio runtime: fetch externo → cache 24 h → seed |
| `.github/workflows/news.yml` | Cron diario que hace lo mismo automáticamente |

---

## Notas

- El cron de GitHub Actions (`news.yml`) ejecuta este mismo flujo diariamente
  a las 05:00 UTC. Esta skill sirve para actualizaciones manuales fuera de
  ese horario.
- La app cachea el feed en localStorage con TTL de 24 h (clave `news:feed:v2`).
  Tras publicar, el usuario necesita hacer un **hard reload** (Ctrl+Shift+R)
  o esperar a que expire el cache para ver los cambios.
- `news-feed.json` no se committea a `main`; vive únicamente en la rama
  huérfana `news-data`.
- Si el script falla con rate-limiting de Google News, esperar unos minutos y
  reintentar con menos equipos a la vez.