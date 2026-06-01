---
name: fetch-crests
description: Descarga y gestiona los escudos oficiales de las selecciones de fútbol del Mundial 2026 desde fuentes oficiales.
---

# Skill: fetch-crests

Esta skill permite descargar, actualizar y verificar los escudos oficiales (en formato vectorial SVG o PNG transparente optimizado) de las 48 selecciones clasificadas al Mundial 2026.

## Cuándo usar esta skill

- "Descarga el escudo de [Selección/País]"
- "Actualiza los logos/escudos que faltan"
- "Obtén los logos oficiales de FIFA de los equipos"
- "Corrige el escudo pixelado de [Equipo]"

## Fuentes Oficiales

La fuente de verdad oficial del torneo es:
- **FIFA 2026 Portal:** `https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026`

Secciones de referencia de datos en el portal FIFA:
- Calendario oficial y estadios.
- Fichas y escudos oficiales de federaciones nacionales.

## Uso

### Comando del Script

```bash
node scripts/fetch-crests.mjs [TEAM_CODES...] [opciones]
```

### Opciones

- `[TEAM_CODES...]`: Códigos FIFA de tres letras de los equipos a procesar (ej: `ESP ARG MEX`). Si se omite, procesa todos los 48 equipos.
- `--force`: Descarga e invalida el caché local reemplazando los escudos existentes.
- `--type [svg|png|all]`: Tipo de formato de salida preferido (por defecto descarga `svg` cuando está disponible y cae a `png` transparente).

### Ejemplos

```bash
# Descargar el escudo de España
node scripts/fetch-crests.mjs ESP

# Forzar la descarga de los escudos de Argentina y México
node scripts/fetch-crests.mjs ARG MEX --force

# Descargar todos los escudos de las 48 selecciones
node scripts/fetch-crests.mjs
```

## Estructura de Salida

*   Los escudos se descargan en el directorio `public/assets/crests/`.
*   El nombre del archivo corresponde al código FIFA del equipo en mayúsculas: `public/assets/crests/ESP.svg` (o `public/assets/crests/ESP.png` si no hay SVG).
