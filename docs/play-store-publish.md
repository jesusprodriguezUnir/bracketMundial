# Guía de publicación en Google Play — Bracket Mundial 2026

> **Estado técnico (mayo 2026):** el proyecto Android con Capacitor ya está configurado y firmado.
> El AAB listo para subir está en `android/app/build/outputs/bundle/release/app-release.aab`.
> Esta guía cubre lo que falta: ficha de Play Console, configuración de la app y flujo de revisión.

---

## Índice

1. [Prerrequisitos de cuenta](#1-prerrequisitos-de-cuenta)
2. [Preparación técnica del binario](#2-preparación-técnica-del-binario)
3. [Crear la app en Play Console](#3-crear-la-app-en-play-console)
4. [Ficha de Play Store](#4-ficha-de-play-store-store-listing)
5. [Configuración de la app](#5-configuración-de-la-app)
6. [Subir el AAB al track de pruebas](#6-subir-el-aab-al-track-de-pruebas)
7. [Precios y distribución](#7-precios-y-distribución)
8. [Envío a revisión y producción](#8-envío-a-revisión-y-producción)
9. [Checklist accionable](#9-checklist-accionable)
10. [Mantenimiento de releases futuras](#10-mantenimiento-de-releases-futuras)

---

## 1. Prerrequisitos de cuenta

| Requisito | Detalle |
|-----------|---------|
| Cuenta de desarrollador Google | Pago único de **25 USD**. Tarjeta de crédito/débito necesaria. |
| Verificación de identidad | Google puede pedir D-U-N-S (organizaciones) o verificación personal (1–2 días hábiles). |
| Política de privacidad pública | URL accesible con política de privacidad. **Requerida** antes de publicar. |
| Email del desarrollador | `jesusprodriguez@gmail.com` (el que quieres mostrar en Play). |

> **Mientras se activa la cuenta:** todo el resto de esta guía puede prepararse. Solo el envío
> final a revisión requiere cuenta activa.

---

## 2. Preparación técnica del binario

### Datos de la app (definitivos, no cambian tras publicar)

```
applicationId:  com.jesusprodriguez.bracketmundial
Keystore:       android/app/release-key.jks
Alias:          my-key-alias
```

> ⚠️ **Nota de seguridad:** el keystore y su contraseña están commiteados en el repo. Con
> **Play App Signing** (obligatorio para apps nuevas vía AAB), Google gestiona la clave de firma
> final y tú usas la del repo como *upload key* — si se compromete, es recuperable desde Play Console.
> Recomendación a futuro: mover la contraseña a un `.env` o secret de CI y añadir `release-key.jks`
> al `.gitignore` si el repo es o pasa a ser público.

### Generar un AAB limpio (hacer antes de cada subida)

```bash
# Desde la raíz del proyecto
npm run build
npx cap sync android

# Compilar el bundle firmado
cd android
./gradlew bundleRelease
```

Salida: `android/app/build/outputs/bundle/release/app-release.aab`

En Windows (PowerShell) sustituye `./gradlew` por `.\gradlew.bat`.

### Verificar la versión antes de subir

El `versionCode` debe ser siempre mayor que la versión anterior publicada en Play.

Archivo: [android/app/build.gradle](../android/app/build.gradle), líneas 9–10:

```groovy
versionCode 1        // Incrementar en cada release (entero, no puede bajar)
versionName "1.0"    // Versión visible al usuario (string libre)
```

Primera publicación: `versionCode 1` está bien. Para actualizaciones usar `2`, `3`…

---

## 3. Crear la app en Play Console

1. Ir a [play.google.com/console](https://play.google.com/console) → **"Todas las apps"** → **"Crear app"**.
2. Rellenar:
   - **Nombre de la app:** `Bracket Mundial 2026` (máx. 30 caracteres, ya caben).
   - **Idioma predeterminado:** Español (España) — `es-ES`.
   - **Tipo:** App (no juego).
   - **¿Gratuita o de pago?:** Gratuita. *(Una app gratuita no puede cambiar a pago después.)*
3. Aceptar las declaraciones de directrices para desarrolladores y leyes de exportación de EE. UU.
4. Pulsar **"Crear app"**.

---

## 4. Ficha de Play Store (Store listing)

Ir a: **Presencia en Play Store → Ficha de Play Store principal**

### Textos (preparar en ES y EN)

#### Nombre de la app
```
Bracket Mundial 2026
```

#### Descripción breve (máx. 80 caracteres)
```
Predice y simula el Mundial FIFA 2026 con cuotas de casas de apuestas reales.
```

#### Descripción completa (máx. 4000 caracteres)
```
Bracket Mundial 2026 es la app definitiva para seguir y predecir el Mundial de Fútbol FIFA 2026.

🏆 CARACTERÍSTICAS PRINCIPALES
• Bracket interactivo con los 48 equipos y 104 partidos del torneo
• Fase de grupos editable: introduce tus marcadores y avanza equipos
• Cuotas 1X2 reales de casas de apuestas para los partidos de grupos
• Simulación automática basada en probabilidades reales (no azar uniforme)
• Calendario completo con fechas, horarios y estadios
• Plantillas de los 48 selecciones con fotos de jugadores y entrenadores
• Vista de estadios de Canadá, México y EE. UU.
• Noticias actualizadas por equipo en español e inglés
• Exporta e importa tu predicción para compartirla
• Diseño PWA offline-first: funciona sin conexión tras la primera carga

📊 ODDS EN TIEMPO REAL
Las cuotas 1X2 se actualizan dos veces al día desde casas de apuestas reales.
Para los partidos sin cuotas aún disponibles se usa un modelo Elo propio.

🌍 COBERTURA COMPLETA
Los 48 equipos, 12 grupos (A–L), ronda de 32, octavos, cuartos, semis, 3.er puesto y final
(19 de julio, MetLife Stadium, Nueva Jersey).

Sin anuncios. Sin registro. Tus predicciones se guardan en el dispositivo.
```

### Recursos gráficos

| Recurso | Especificaciones | Fuente |
|---------|-----------------|--------|
| Icono | 512×512 px PNG, sin transparencia | `public/icons/icon-512.png` |
| Gráfico destacado | 1024×500 px JPG o PNG | Crear con Figma/Canva o captura editada |
| Capturas de teléfono | Mín. 2, máx. 8; 16:9 o 9:16; mín. 320 dp | Ver sección de capturas ↓ |
| Capturas de tablet (opc.) | 16:9 o 9:16 | Recomendado si quieres badge "optimizada para tablet" |

#### Cómo generar las capturas

Con el script de Playwright ya existente en el proyecto:
```bash
npm run video          # Genera vídeo/capturas de la sesión
```
O manualmente: instalar la PWA en un Android, hacer capturas de pantalla de:
1. Vista de grupos (tabla + marcadores)
2. Bracket eliminatorio
3. Modal de partido con cuotas
4. Vista de plantillas/squads

### Categoría y contacto

- **Categoría:** Deportes
- **Etiquetas:** mundial, fútbol, bracket, predicciones, FIFA 2026
- **Email de contacto:** `jesusprodriguez@gmail.com`
- **Sitio web:** URL de la app desplegada en Vercel (p. ej. `https://bracket-mundial.vercel.app`)
- **Política de privacidad:** URL pública con la política (**obligatorio**)

---

## 5. Configuración de la app

### 5.1 Clasificación de contenido (IARC)

Ruta: **Configuración de la app → Clasificación de contenido → Iniciar cuestionario**

Respuestas esperadas para esta app:

| Pregunta | Respuesta |
|----------|-----------|
| Violencia | No |
| Lenguaje soez | No |
| Contenido sexual | No |
| Sustancias controladas | No |
| Temas de miedo/horror | No |
| Juego de azar con dinero real | **No** ← importante: las cuotas son informativas, no se puede apostar dinero |
| Contenido generado por usuarios | No |

La clasificación resultante será probablemente **3+** o **PEGI 3** — ideal para máxima distribución.

### 5.2 Público objetivo y contenido

Ruta: **Configuración de la app → Público objetivo y contenido**

- **Edad objetivo:** 13+ (o "Todos los usuarios" si no hay restricción).
- La app **no está dirigida principalmente a niños** → declara que el público objetivo es adulto/general.

### 5.3 Seguridad de los datos (Data safety)

Ruta: **Configuración de la app → Seguridad de los datos**

Esta sección es importante. Respuestas correctas para Bracket Mundial 2026:

| Pregunta | Respuesta |
|----------|-----------|
| ¿Recopila o comparte datos con terceros? | **No** |
| Datos del usuario recopilados | Ninguno (predicciones en localStorage del dispositivo, no se envían) |
| Datos del dispositivo | Ninguno |
| Uso de datos de ubicación | No |
| Datos de Analytics | Vercel Analytics usa datos anónimos de navegación — declarar si aplica* |
| Cifrado en tránsito | Sí (HTTPS) |
| Eliminación de datos | N/A (no hay cuenta ni datos remotos) |

> *Vercel Analytics recopila métricas de uso anónimas (pageviews, Web Vitals). Si se considera
> necesario declararlo, clasificarlo como "Diagnóstico/Rendimiento de la app, no compartido con terceros".

### 5.4 Anuncios

- La app **no contiene anuncios** (`@vercel/analytics` es analítica, no red de anuncios).
- Declarar: **"Esta app no contiene anuncios"**.

### 5.5 Permisos de APIs sensibles

**No aplica.** El `AndroidManifest.xml` solo declara:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```
Sin ubicación en background, accesibilidad, SMS, cámara, contactos ni ninguna API sensible →
**no se requieren declaraciones adicionales, no se alarga la revisión por este motivo.**

### 5.6 Acceso a la app

- La app **no requiere login** → marcar **"Todas las funciones disponibles sin restricciones de acceso"**.
- No es necesario proporcionar credenciales de prueba.

---

## 6. Subir el AAB al track de pruebas

### Recomendación: empezar por Pruebas internas

Ruta: **Pruebas → Pruebas internas → Crear nueva versión**

1. Subir `android/app/build/outputs/bundle/release/app-release.aab`.
2. Play verificará el AAB y mostrará el resumen (nombre del paquete, versión, firma).
3. Redactar notas de la versión:
   ```
   Primera versión de Bracket Mundial 2026.
   Bracket interactivo completo con cuotas 1X2 en tiempo real para el Mundial FIFA 2026.
   ```
4. Añadir emails de testers internos (mín. 1, máx. 100).
5. Guardar y publicar en el track interno.

> El track interno no pasa por revisión completa de Play → disponible para testers en minutos.
> Ideal para validar que la app funciona antes del envío a producción.

### Promover a Prueba cerrada (opcional)

Una vez validado en interno, promover a **Prueba cerrada (alfa)** para ampliar testers
antes del lanzamiento público.

---

## 7. Precios y distribución

Ruta: **Monetización → Precios y distribución**

- **Precio:** Gratuita.
- **Países:** Seleccionar todos, o al mínimo:
  - España, México, Argentina, Colombia, Chile, Perú, Uruguay, Paraguay, Ecuador, Bolivia,
    Venezuela, Costa Rica, Honduras, El Salvador, Guatemala, Nicaragua, Panamá, Cuba, Rep. Dominicana,
    EE. UU., Canadá, Marruecos, Senegal, Japón, Corea del Sur, Australia (sede/participantes del Mundial).
- **Contiene anuncios:** No.
- Aceptar declaración de directrices de contenido y leyes de exportación de EE. UU.

---

## 8. Envío a revisión y producción

1. Comprobar que **todas las secciones del panel de publicación tienen check verde** ✓.
   Las secciones obligatorias antes de publicar en producción son:
   - Ficha de Play Store ✓
   - Clasificación de contenido ✓
   - Público objetivo ✓
   - Seguridad de los datos ✓
   - Precios y distribución ✓
   - Al menos una versión subida en un track ✓
   - Política de privacidad (URL) ✓

2. Ir a **Producción → Crear nueva versión** (o promover desde pruebas internas).

3. Seleccionar porcentaje de lanzamiento:
   - **100%** para publicación completa inmediata.
   - **10–20%** para lanzamiento gradual (recomendado para primera vez).

4. Pulsar **"Enviar para revisión"**.

5. Tiempos de revisión típicos para apps nuevas:
   - Primera revisión: **1–7 días** (habitualmente 24–72 h).
   - No hay APIs sensibles → **sin demora adicional** por declaraciones especiales.

6. Se recibirá email de confirmación cuando la app esté publicada.

---

## 9. Checklist accionable

### Preparación técnica
- [ ] AAB firmado generado (`npm run build && npx cap sync && ./gradlew bundleRelease`)
- [ ] `versionCode` y `versionName` revisados en `android/app/build.gradle`
- [ ] Icono 512×512 preparado (`public/icons/icon-512.png`)
- [ ] Gráfico destacado 1024×500 creado
- [ ] Mínimo 2 capturas de teléfono preparadas
- [ ] Política de privacidad publicada en URL accesible

### Play Console — Configuración de la app
- [ ] App creada en Play Console
- [ ] Ficha principal rellenada (nombre, descripción breve, descripción completa)
- [ ] Recursos gráficos subidos (icono, destacado, capturas)
- [ ] Categoría y datos de contacto configurados
- [ ] Clasificación de contenido IARC completada
- [ ] Público objetivo declarado (13+ / todos)
- [ ] Seguridad de los datos rellenada
- [ ] Anuncios declarados (no contiene)
- [ ] Acceso a la app configurado (sin restricciones)

### Play Console — Track y distribución
- [ ] AAB subido al track interno y validado
- [ ] Notas de versión redactadas
- [ ] Países de distribución seleccionados
- [ ] Precios confirmados (gratuita)
- [ ] Todos los checks verdes en el panel de publicación

### Envío
- [ ] Versión promovida a producción
- [ ] Revisión enviada
- [ ] Confirmación de publicación recibida por email

---

## 10. Mantenimiento de releases futuras

Para cada actualización de la app:

```bash
# 1. Editar versionCode y versionName en android/app/build.gradle
#    versionCode debe ser mayor que el anterior

# 2. Rebuildar
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease   # (o .\gradlew.bat en PowerShell)

# 3. En Play Console: Producción → Crear nueva versión → subir nuevo .aab
```

### Tabla de versiones (ir actualizando)

| versionCode | versionName | Fecha | Novedades |
|-------------|-------------|-------|-----------|
| 1 | 1.0 | jun 2026 | Primera publicación |
| 2 | 1.1 | — | — |

---

*Generado con Claude Code · bracketMundial · mayo 2026*
