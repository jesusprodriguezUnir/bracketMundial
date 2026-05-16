# Tournament News Skill

Este skill permite actualizar las noticias de las selecciones del Mundial 2026 mediante Google News RSS.

## Cuándo usar este skill

- "Actualiza las noticias de [Selección]"
- "Busca noticias recientes de [Equipo]"
- "Refresca el feed de noticias"

## Uso

### Comando del Script

```bash
node scripts/generate-news.mjs [equipo] [opciones]
```

### Opciones

- `[equipo]`: Código FIFA del equipo (ESP, MEX, KOR, etc.). Si se omite, actualiza todos.
- `--write-seed`: Además de actualizar `news-feed.json`, regenera `src/data/news/seed.ts` para persistir las noticias en el build.

### Ejemplos

```bash
# Actualizar noticias de Corea del Sur (solo el feed JSON)
node scripts/generate-news.mjs KOR

# Actualizar noticias de España y regenerar el seed de datos
node scripts/generate-news.mjs ESP --write-seed
```

## Lógica de Funcionamiento

1.  El script consulta Google News para el equipo especificado en español e inglés.
2.  Filtra por fuentes confiables (whitelist).
3.  Ordena las noticias por fecha (más recientes primero).
4.  Actualiza `news-feed.json` sin borrar las noticias de otros equipos que no se estén actualizando en ese momento.
5.  Si se usa `--write-seed`, actualiza el archivo TypeScript para fallback offline.
