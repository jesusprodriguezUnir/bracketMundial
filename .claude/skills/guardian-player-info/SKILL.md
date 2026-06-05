---
name: guardian-player-info
description: >
  Gestiona y extrae la información completa del perfil de jugadores del Guardian
  (biografías, partidos internacionales/caps, goles con la selección y etiquetas especiales/talentos).
  Úsala cuando el usuario pida: perfiles completos del Guardian, biografía de jugadores,
  partidos internacionales de la plantilla, goles de la selección, jugador a seguir al hover,
  popover tipo cromo al pasar el cursor.
---

# Skill: guardian-player-info

Extrae y sincroniza **perfiles enriquecidos** de las 48 selecciones desde la guía interactiva del Guardian para alimentar el popover de hover instantáneo (estilo cromo retro) sin consumo de red en escritorio.

---

## Flujo de trabajo

### 1. Preparar y Previsualizar (ARG por defecto)

Antes de actualizar los 48 equipos, corre el script con `--dry-run` para un solo equipo para validar el mapeo:

```bash
npm run guardian -- ARG --dry-run
```

Esto mostrará el conteo de jugadores, altas, bajas, dorsales a reconciliar y las fotos pendientes.

### 2. Actualizar Datos de un Equipo

Genera el archivo `.ts` correspondiente (por ejemplo, `src/data/squads/arg.ts`) incluyendo los nuevos campos: `bio` (biografía limpia de HTML), `caps` (internacionalidades), `goals` (goles con el país), y `special` (etiqueta de jugador a seguir):

```bash
npm run guardian -- ARG --data
```

Revisa los cambios con `git diff src/data/squads/arg.ts` para cerciorarte de que las bios y etiquetas largas están bien escapadas vía `JSON.stringify()`.

### 3. Compilación y Lógica

Valida la integridad de la base de datos tipada de TypeScript y los tests unitarios de fixtures del bracket:

```bash
npm run build
npm test
```

### 4. Flujo Completo (48 selecciones)

Una vez verificado un equipo piloto, regenera toda la base de datos de plantillas estáticas:

```bash
npm run guardian -- --data
```

---

## Representación en la UI (Hover Popover)

- **Componente**: `<player-hover-card>` en [src/components/player-hover-card.ts](file:///d:/Personal/bracketMundial/src/components/player-hover-card.ts)
- **Activación**: Se despliega en escritorio al pasar el cursor (`@mouseenter`) sobre el avatar del jugador en la tabla de plantilla o la cuadrícula de tarjetas, y se limpia al salir (`@mouseleave`).
- **Control Táctil**: Desactivado automáticamente en móviles y pantallas táctiles mediante consultas de medios `(hover: hover)` para asegurar que el click nativo que abre el modal completo `<player-card>` siga siendo la vía principal de navegación sin estorbos.
- **Evitar Recortes**: Renderizado en el nivel `:host` de `squads-view.ts` con `position: fixed` para eludir límites de contenedores con `overflow-x: auto`.

---

## Claves de Traducción Utilizadas

- `player.labelCaps`: "Partidos" (es) / "Caps" (en)
- `player.labelGoals`: "Goles" (es) / "Goals" (en)
- `player.special`: "Jugador a seguir" (es) / "One to watch" (en)
