---
name: panini-extractor
description: Extrae información de jugadores desde PDFs de álbumes de cromos Panini y la guarda en la base de datos (archivos .ts de squads). Usa las capacidades de visión del agente para leer el PDF directamente.
---

# Panini Extractor Skill

Esta skill te permite extraer datos de jugadores directamente de documentos PDF que contienen escaneos de álbumes de cromos Panini, y usar esos datos para actualizar la "base de datos" del proyecto (`src/data/squads/[equipo].ts`).

## Cuándo usar esta skill
- El usuario te pide "extraer datos de un PDF de Panini" (ej. `docs/HOLANDA.pdf`).
- El usuario indica "saca la información de estos cromos y guárdala".
- El usuario menciona actualizar la base de datos a partir de imágenes o PDFs de Panini.

## Instrucciones Operativas

1. **Lee el archivo PDF visualmente:**
   Usa la herramienta `view_file` apuntando al PDF proporcionado por el usuario (ej: `d:\Personal\bracketMundial\docs\HOLANDA.pdf`). Esta herramienta renderizará el PDF en imágenes (screenshots) y te las enviará en la respuesta, permitiéndote "leer" visualmente el contenido del álbum.

2. **Extrae los datos (mediante visión):**
   Analiza meticulosamente las imágenes de los cromos y extrae por cada jugador:
   - **Nombre:** Aparece impreso en cada cromo.
   - **Fecha de nacimiento:** Aparece en formato numérico bajo el nombre. Calcula la **edad** restando el año de nacimiento al año del mundial (`2026`). (Ej: Si nació en `18-08-2002`, la edad es `2026 - 2002 = 24`).
   - **Club actual:** Aparece en la parte inferior del cromo (ej: "Brighton & Hove Albion FC (ENG)" -> "Brighton"). Usa nombres cortos y estandarizados para el club.
   - **Posición:** En la esquina superior derecha del cromo hay un ícono. Basándote en el ícono (manos para portero, escudo para defensa, etc.) y en tu conocimiento general de fútbol, deduce si es `GK`, `DF`, `MF` o `FW`.
   - **Dorsal (number):** Los cromos Panini típicamente no tienen el dorsal exacto. Si no está en el cromo, infiérelos de tu conocimiento del jugador o mantén el dorsal que estuviera definido previamente en el archivo del equipo.

3. **Mapea al equipo correcto:**
   Identifica la selección en base a la página (por ejemplo, los cromos suelen indicar "NETHERLANDS"). 
   Determina el archivo correspondiente en la ruta `src/data/squads/` (por ejemplo, `ned.ts` para Holanda). 

4. **Actualiza la Base de Datos:**
   Examina primero el archivo `.ts` del equipo usando `view_file`.
   Luego, usa la herramienta `replace_file_content` o `multi_replace_file_content` para actualizar el arreglo `export const squad: Player[] = [...]` reemplazándolo con los datos consolidados que extrajiste.
   Respeta estrictamente el modelo de datos de TypeScript:

   ```typescript
   export const squad: Player[] = [
     { number: 1,  name: 'Bart Verbruggen',        position: 'GK', age: 24, club: 'Brighton' },
     { number: 10, name: 'Memphis Depay',          position: 'FW', age: 32, club: 'Corinthians' },
     // ... resto de jugadores extraídos
   ];
   ```

5. **Alineación (Lineup):**
   Si la actualización modifica dorsales que se usan en `startingXI`, actualiza también la variable `lineup` al final del mismo archivo para que apunte a los números correctos.

## Nota Importante
**NO requieres scripts en Python o Node.js.** Posees capacidades multimodales (visión) integradas en este entorno. Al usar `view_file` en un `.pdf`, el sistema hace el trabajo pesado y te inyecta las imágenes automáticamente. Tu único trabajo es extraer los datos y escribirlos en código.
