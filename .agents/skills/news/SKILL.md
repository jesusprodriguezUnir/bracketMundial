---
name: news
description: >
  Actualiza el feed de noticias del Mundial 2026 y lo publica en la app.
  Úsala cuando el usuario pregunte por: actualizar noticias, refrescar
  noticias de un equipo, publicar feed de noticias, noticias desactualizadas,
  news feed, update news.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: news

Actualiza las noticias de uno o todos los equipos y las guarda directamente en la base de datos Supabase (`team_news`), que es la fuente de verdad consumida por la aplicación en tiempo real. 

## Flujo de trabajo

### 1. Ingestar el feed a Supabase

El script principal de ingesta consulta múltiples fuentes (GNews, NewsAPI, Google News RSS y RSS oficiales) y hace un "upsert" en Supabase.

```bash
# Ingestar noticias para todos los equipos (los 48):
node scripts/ingest-news.mjs

# Ingestar noticias para equipos específicos (por código de 3 letras):
node scripts/ingest-news.mjs ARG ESP BRA

# Forzar actualización (ignora la caché inteligente de 1 hora):
node scripts/ingest-news.mjs ARG ESP --force
```

El script muestra estadísticas y hace un skip automático de los equipos actualizados hace menos de 1 hora para evitar cuotas de API excesivas, a menos que uses el flag `--force`.

### 2. Verificar la actualización (Opcional)

Si necesitas confirmar que las noticias se han guardado correctamente en Supabase para un equipo en particular:

```bash
node scripts/supabase-inspect.mjs --news ESP
```

También puedes ver estadísticas generales o los registros más recientes de todos los equipos:

```bash
node scripts/supabase-inspect.mjs
```

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/ingest-news.mjs` | Script principal de ingesta a Supabase |
| `scripts/supabase-inspect.mjs` | Script para inspeccionar el estado y últimas noticias en la base de datos |
| `.github/workflows/news.yml` | Cron diario que ejecuta la ingesta en GitHub Actions de forma automática |

---

## Notas

- La app en producción ahora lee las noticias directamente desde Supabase. Ya no es necesario generar un archivo `seed.ts` ni hacer `force-push` a la rama `news-data`.
- El TTL (Time To Live) de las noticias en base de datos es de 30 días y se maneja automáticamente por el script de ingesta (limpieza automática).
- Si hay errores o rate-limits, el script tiene mecanismos de reintentos y fallback a fuentes gratuitas (Google News RSS, RSS Oficiales).