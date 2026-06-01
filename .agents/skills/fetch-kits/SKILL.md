---
name: fetch-kits
description: Descarga y gestiona las camisetas oficiales de local (home) y visitante (away) para las selecciones del Mundial 2026.
---

# Skill: fetch-kits

Esta skill permite descargar, ensamblar y verificar las camisetas oficiales (primera y segunda equipación) de las 48 selecciones del Mundial 2026, optimizándolas en formato PNG transparente y organizándolas en la estructura local del proyecto.

## Cuándo usar esta skill

- "Descarga la camiseta de [Selección]"
- "Obtén la equipación local y visitante de [País]"
- "Faltan las camisetas de [Equipo] en la pizarra táctica"
- "Actualiza los diseños de jerseys para el Mundial"

## Fuentes Oficiales

La fuente de verdad oficial para las selecciones y sus equipaciones es:
- **FIFA 2026 Portal:** `https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026`

Secciones de referencia de datos en el portal FIFA:
- Diseños y colores oficiales de las equipaciones home y away de las federaciones participantes.

## Uso

### Comando del Script

```bash
node scripts/fetch-kits.mjs [TEAM_CODES...] [opciones]
```

### Opciones

- `[TEAM_CODES...]`: Lista de códigos de selecciones (ej: `BRA GER FRA`). Si se omite, se procesan las 48 selecciones.
- `--force`: Fuerza la sobrescritura y redescarga de los archivos locales existentes.
- `--type [home|away|all]`: Filtra por equipación local, visitante o ambas (por defecto procesa ambas).

### Ejemplos

```bash
# Descargar equipaciones de Brasil
node scripts/fetch-kits.mjs BRA

# Forzar la redescarga de camisetas de Alemania y Francia
node scripts/fetch-kits.mjs GER FRA --force

# Descargar las segundas equipaciones de todas las selecciones
node scripts/fetch-kits.mjs --type away
```

## Estructura de Salida

*   Los jerseys se guardan en el directorio `public/assets/kits/`.
*   Nomenclatura: `public/assets/kits/{TEAM}_home.png` y `public/assets/kits/{TEAM}_away.png` (en minúsculas la parte del tipo de equipación, por ejemplo: `public/assets/kits/ARG_home.png` / `public/assets/kits/ARG_away.png`).
