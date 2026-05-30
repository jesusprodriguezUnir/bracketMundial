---
name: playwright-leagues
description: >
  Automatización de navegador con Playwright orientada al funcionamiento
  de ligas de usuarios (Mini-Ligas) en bracketMundial.
  Explica cómo se crea, edita, comparte y simula información de una liga,
  proporcionando selectores precisos para interactuar con el Shadow DOM.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: playwright-leagues

Guía técnica y operativa para automatizar la interacción y generación de contenido visual relacionado con la sección de **Mini-Ligas** en `bracketMundial`.

---

## Comandos rápidos

```bash
# Ejecutar y grabar el recorrido tutorial de ligas (genera MP4)
npm run video:leagues

# Ruta del output de video tutorial
# recordings/leagues-tutorial.mp4
```

---

## Arquitectura y Lógica de las Ligas

La sección de ligas tiene un diseño dinámico de tipo álbum Panini retro y cuenta con tres características fundamentales:

### 1. Persistencia y Almacenamiento (`useLeaguesStore`)
El estado de las ligas se gestiona mediante un store de Zustand persistido en el localStorage bajo la clave `mundial-2026-leagues`. Cada liga contiene:
- Un identificador único generado de forma segura.
- Una lista de participantes (`participants`), cada uno con sus predicciones independientes de fase de grupos (`groupScores`) y fase eliminatoria (`knockoutScores`), así como su pronóstico de MVP y Máximo Goleador.

### 2. Context Switching en el Tournament Store (`switchContext`)
Cuando un usuario presiona **"Editar mi predicción en esta liga"**, la aplicación realiza una de sus operaciones más ingeniosas:
- Se ejecuta `useTournamentStore.getState().switchContext({ kind: 'league', leagueId: this._activeLeagueId })`.
- Esto redirige al usuario a la sección principal de grupos o cruces, pero todo el bracket y las clasificaciones ahora operan sobre los datos específicos de ese participante de la liga en lugar de sus predicciones globales.
- Al guardar o simular resultados, la aplicación actualiza el estado de la liga correspondiente.

### 3. Modos de Visualización (Real vs. Simulación)
- **Modo Real (`_viewMode = 'real'`)**: Calcula el puntaje de los miembros de la liga contrastando sus predicciones únicamente contra los resultados oficiales cargados del Mundial.
- **Modo Simulación (`_viewMode = 'projection'`)**: Permite simular de forma ficticia todo el torneo utilizando las cuotas y probabilidades reales de los equipos. El sistema proyecta el puntaje de todos los participantes y estima quién ganaría la liga según cada posible escenario.

---

## Shadow DOM y Selectores Clave para Ligas

La aplicación utiliza componentes Lit encapsulados con Shadow DOM. Playwright cruza de manera nativa los shadow roots utilizando selectores CSS tradicionales. A continuación se listan los selectores exactos para interactuar con las ligas:

### Navegación Principal
```js
// Botón para ir a la pestaña de Ligas (Bottom Nav)
const leaguesTab = page.locator('.bottom-nav-btn').filter({ hasText: 'Liga' });
await leaguesTab.click();
```

### 1. Creación de una Liga (Lista de Ligas)
Los inputs de creación inline se encuentran bajo el contenedor `.lg-v2-create-inline`:
```js
// Input de nombre de la liga
const leagueNameInput = page.locator('.lg-v2-create-inline input').nth(0);
await leagueNameInput.fill('Liga de Campeones 2026');

// Input de nombre del propietario/propietaria
const ownerNameInput = page.locator('.lg-v2-create-inline input').nth(1);
await ownerNameInput.fill('Jesús');

// Botón para crear la liga
const createBtn = page.locator('.lg-v2-create-inline button').filter({ hasText: 'Crear' });
await createBtn.click();
```

### 2. Unirse a una Liga por Código de Invitación
```js
// Botón para abrir el modal de unirse
const openJoinBtn = page.locator('.lg-v2-btn').filter({ hasText: 'Unirse a una liga' });
await openJoinBtn.click();

// Esperar a que el modal esté visible
const joinModal = page.locator('.lg-v2-modal');
await joinModal.waitFor({ state: 'visible' });

// Input del código de invitación
const joinCodeInput = joinModal.locator('input[placeholder*="Código" i]');
await joinCodeInput.fill('CHA-Y8F9');

// Confirmar unión a la liga
const submitJoinBtn = joinModal.locator('button.primary').filter({ hasText: 'Unirse' });
await submitJoinBtn.click();
```

### 3. Configuración de Premios Individuales (MVP / Goleador)
El panel interactivo de premios individuales en la liga permite elegir jugadores mediante una búsqueda:
```js
// --- Máximo Goleador ---
// Click en el botón de selección de Goleador (primer premio)
await page.locator('.awards-grid .award-card').nth(0).locator('button.award-btn').click();
// Esperar modal de búsqueda e ingresar consulta
await page.locator('.awards-search-input').fill('Mbappe');
// Click en el primer jugador de la lista
await page.locator('.search-player-item').first().click();

// --- MVP ---
// Click en el botón de selección de MVP (segundo premio)
await page.locator('.awards-grid .award-card').nth(1).locator('button.award-btn').click();
// Esperar modal e ingresar consulta
await page.locator('.awards-search-input').fill('Yamal');
// Seleccionar primer jugador
await page.locator('.search-player-item').first().click();
```

### 4. Edición de Predicciones en la Liga
```js
// Botón para iniciar edición contextual de predicciones en la liga activa
const editPredictionsBtn = page.locator('.lg-v2-edit-prediction-row button');
await editPredictionsBtn.click();
```

### 5. Control de Simulación y Descargas (Modos)
```js
// Activar el modo simulación (Proyección)
const simulationTab = page.locator('.lg-league-chip-btn').filter({ hasText: 'Simulación' });
await simulationTab.click();

// Botón para simular todo el torneo de forma realista
const simulateAllBtn = page.locator('.lg-simulate-world-btn').filter({ hasText: 'Simular' });
await simulateAllBtn.click();

// Botón para exportar predicciones de la liga a Excel
const excelExportBtn = page.locator('.lg-btn-sm').filter({ hasText: 'Excel' });
await excelExportBtn.click();
```

---

## Patrones de Automatización Reutilizables

### A. Limpiar Estado de Ligas al Iniciar
Para garantizar que las grabaciones o tests comiencen sin interferencias de estados anteriores en el navegador, se debe inyectar este código para borrar la persistencia del Zustand store:
```js
await page.evaluate(async () => {
  const storeModule = await import('/src/store/leagues-store.ts');
  storeModule.useLeaguesStore.setState({ leagues: [], activeLeagueId: null });
});
await page.reload({ waitUntil: 'networkidle' });
```

### B. Zoom del Navegador Ajustado (Horizontal 16:9)
Para que la interfaz estilo Panini se vea espectacular y balanceada en video 1080p, se recomienda fijar un escalado en el CSS del viewport:
```js
await page.evaluate(() => {
  document.body.style.zoom = '0.90';
});
```

---

## Archivos clave relacionados

| Archivo | Propósito |
|---------|-----------|
| `scripts/record-leagues.mjs` | Script de grabación automatizada del tutorial de ligas |
| `src/components/leagues-view.ts` | Componente visual principal de la sección de ligas |
| `src/store/leagues-store.ts` | Zustand store para ligas persistido en local |
| `src/lib/league-codec.ts` | Lógica de encriptado y codificación de predicciones para compartir urls |
