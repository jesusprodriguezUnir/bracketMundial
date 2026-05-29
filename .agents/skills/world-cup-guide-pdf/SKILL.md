---
name: world-cup-guide-pdf
description: >
  Genera un PDF completo con la Guía del Mundial 2026 a partir de los datos
  de la aplicación. Úsala cuando el usuario pida: guía del mundial en PDF,
  exportar guía, generar PDF de la guía, descargar guía completa, world cup
  guide PDF, imprimir guía del mundial, o invocar internamente la generación de la guía.
---

# Skill: Guía del Mundial 2026 en PDF

Esta skill permite generar de forma automatizada un PDF completo, imprimible y de alta calidad de la Guía del Mundial 2026. Utiliza un navegador headless (Playwright) para levantar la aplicación, cargar la vista de impresión unificada (`#guide-print`), renderizar todos los datos actualizados y generar el PDF a través del exportador nativo de la app.

## Requisitos previos

- Node.js instalado.
- Dependencias del proyecto instaladas (`npm install`).
- Navegadores de Playwright instalados (`npx playwright install chromium`).

## Comandos y parámetros

El script principal se ejecuta a través de:

```bash
npm run guide:pdf [opciones]
```

### Opciones disponibles

| Opción | Descripción | Valores por defecto / posibles |
|--------|-------------|--------------------------------|
| `--lang` | Idioma de la guía a generar. | `es` (por defecto) o `en` |
| `--mode` | Origen de los datos (simulación IA vs predicciones de usuario). | `auto` (por defecto) o `user` |
| `--output` | Ruta de guardado para el archivo PDF final. | Generada dinámicamente si se omite |

### Ejemplos de uso

```bash
# Generar guía completa en español (por defecto)
npm run guide:pdf

# Generar guía completa en inglés
npm run guide:pdf -- --lang en

# Generar guía usando las predicciones guardadas por el usuario en lugar de simulación aleatoria
npm run guide:pdf -- --mode user

# Generar guía en inglés con simulación en un archivo específico
npm run guide:pdf -- --lang en --mode auto --output marketing/guide/FIFA-2026-World-Cup-Guide-EN.pdf
```

## Salida esperada

El PDF se genera en la carpeta `marketing/guide/` con nombres normalizados:
- Español: `guia-mundial-2026-es.pdf`
- Inglés: `guia-mundial-2026-en.pdf`

El archivo final incluirá:
1. Portada premium de diseño Panini retro.
2. Calendario de partidos completo (fase de grupos y eliminatorias).
3. Fichas individuales con plantilla de 26 jugadores, alineación y ficha de entrenador para los 48 equipos.
4. Podio final de predicciones y bracket eliminatorio simulado o del usuario.
