---
name: update-news
description: 'Actualizar el feed de noticias de bracketMundial en español e inglés. Usa cuando el usuario pida "actualizar noticias", "regenerar noticias", "news feed", "actualizar feed", "noticias desactualizadas" o "publicar noticias". Obtiene las 3 últimas noticias por equipo desde Google News RSS (ES + EN) y las publica en la rama news-data.'
argument-hint: '--write-seed para regenerar también el fallback bundleado'
---

# Actualizar Feed de Noticias

## Qué produce

Genera `news-feed.json` con las 3 últimas noticias por selección en español e inglés (48 equipos × 2 locales = hasta 288 items) y lo publica en la rama `news-data` de GitHub, desde donde lo sirve la app en producción.

## Cuándo usar

- Las noticias de la web llevan más de 24 h sin actualizarse
- Se quiere forzar una actualización manual fuera del cron diario
- Se añadieron nuevos equipos o se cambió la whitelist de fuentes en `scripts/generate-news.mjs`
- El seed de fallback (`src/data/news/seed.ts`) está desactualizado

---

## Procedimiento

### Opción A — Trigger manual vía GitHub Actions (sin tocar el repo local)

1. Ve a **GitHub → Actions → "Update news feed"**
2. Haz clic en **Run workflow** (rama `main`)
3. El workflow genera el JSON, lo compara con `news-data` y, si cambió, fuerza el push

### Opción B — Ejecución local

#### 1. Asegúrate de estar en `main` y con dependencias instaladas

```bash
git checkout main
npm install
```

#### 2. Genera el feed

```bash
# Solo news-feed.json
node scripts/generate-news.mjs

# También regenera src/data/news/seed.ts (fallback bundleado)
node scripts/generate-news.mjs --write-seed
```

El script tarda varios minutos (delay de 300 ms entre peticiones a Google News).
Comprueba la salida: cada equipo debe mostrar `✓ X items ES / X items EN`.

#### 3. Si usaste `--write-seed`, commitea seed.ts en main

```bash
git add src/data/news/seed.ts
git commit -m "chore: regenerate news seed"
git push origin main
```

#### 4. Publica news-feed.json en la rama news-data

```bash
# Guarda el JSON generado
cp news-feed.json ../news-feed-tmp.json

# Cambia a news-data (rama huérfana, solo tiene news-feed.json y vercel.json)
git checkout news-data

# Copia y commitea
cp ../news-feed-tmp.json news-feed.json
git add news-feed.json
git commit -m "chore: update news feed $(Get-Date -Format 'yyyy-MM-dd')"
git push origin news-data

# Vuelve a main
git checkout main
```

---

## Arquitectura del sistema

```
GitHub Actions (cron 05:00 UTC)
  └─ scripts/generate-news.mjs
       └─ Google News RSS × 48 equipos × 2 locales
            └─ news-feed.json  →  push a rama news-data

Navegador (runtime)
  └─ src/lib/news-service.ts
       ├─ fetch https://raw.githubusercontent.com/.../news-data/news-feed.json
       ├─ cache localStorage 24 h
       └─ fallback → src/data/news/seed.ts (bundleado)
```

## Archivos relevantes

| Archivo | Rol |
|---|---|
| [scripts/generate-news.mjs](../../../scripts/generate-news.mjs) | Script generador |
| [.github/workflows/news.yml](../../../.github/workflows/news.yml) | Cron diario + trigger manual |
| [src/lib/news-service.ts](../../../src/lib/news-service.ts) | Servicio de fetch en runtime |
| [src/data/news/seed.ts](../../../src/data/news/seed.ts) | Fallback bundleado |
| `news-feed.json` (rama `news-data`) | Feed servido en producción |

## Diagnóstico rápido

| Síntoma | Causa probable | Solución |
|---|---|---|
| Noticias estáticas >24 h | Cron falló o sin cambios | Revisa Actions; ejecuta manualmente |
| `⚠ fetch failed` en el script | Google News bloqueó la IP | Reintenta más tarde o usa VPN |
| App muestra seed en vez de feed | `raw.githubusercontent.com` inaccesible | Normal en dev; en prod verifica la rama `news-data` |
| Pocos items por equipo | Equipo poco cubierto o whitelist muy estricta | Añade fuentes a `WHITELIST` en el script |
