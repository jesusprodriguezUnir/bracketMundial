# Plan: Guía de publicación en Google Play Console

## Context

El usuario quiere publicar **Bracket Mundial 2026** en Google Play y necesita un documento `.md`
con todos los pasos a realizar mientras se confirma/activa la cuenta de Play Console.

Hallazgos de la exploración del repo (estado real, mejor de lo esperado):

- Ya existe un proyecto **Android con Capacitor** completamente configurado:
  - `capacitor.config.ts`: `appId: com.jesusprodriguez.bracketmundial`, `appName: "Bracket Mundial 2026"`, `webDir: dist`.
  - `android/app/build.gradle`: `applicationId com.jesusprodriguez.bracketmundial`, `versionCode 1`, `versionName "1.0"`, `signingConfigs.release` apuntando a `release-key.jks`.
  - Keystore presente: `android/app/release-key.jks` (alias `my-key-alias`).
  - AAB firmado ya generado: `android/app/build/outputs/bundle/release/app-release.aab`.
- **Riesgo de APIs sensibles: NO aplica.** `android/app/src/main/AndroidManifest.xml` solo declara
  `android.permission.INTERNET`. Sin ubicación en background, accesibilidad, SMS, ni cámara/contactos
  → **no** requiere declaraciones adicionales ni alarga la revisión.
- Es app Capacitor (assets web empaquetados, no TWA) → **no** necesita `assetlinks.json` ni
  verificación de dominio.

Decisiones:
- App **gratuita** (sin perfil de pagos del comerciante).
- Keystore: **dejarlo como está** (no se modifica `build.gradle`; se documenta el caveat de seguridad).

Conclusión: el trabajo técnico está casi terminado. Lo que falta es (a) un ajuste menor de
versión/regeneración del AAB y (b) sobre todo, los pasos operativos en Play Console.

## Entregable principal

Ver la guía completa paso a paso en [play-store-publish.md](play-store-publish.md).

### 1. Prerrequisitos de cuenta
- Cuenta de desarrollador Google Play (pago único 25 USD), verificación de identidad/D-U-N-S si aplica a organización.
- Mientras se confirma: todo lo demás de esta guía puede prepararse sin la cuenta activa salvo el envío final a revisión.

### 2. Preparación técnica del binario (lo que hacemos en el repo antes de subir)
- Confirmar identidad de la app: `applicationId = com.jesusprodriguez.bracketmundial` (definitivo, no se puede cambiar tras publicar).
- Subir `versionCode` para cada release (queda en `2`+ tras la primera; primera subida usa `1`).
- Regenerar AAB limpio y firmado:
  ```bash
  npm run build
  npx cap sync android
  cd android && ./gradlew bundleRelease
  ```
  Salida: `android/app/build/outputs/bundle/release/app-release.aab`.
- Nota de seguridad (documentada, sin acción ahora): `release-key.jks` y su contraseña están en el
  repo; con Play App Signing (obligatorio para apps nuevas con AAB) la clave de carga es
  recuperable, pero conviene no exponer el repo públicamente.

### 3. Crear la app en Play Console
- Play Console → "Crear app": nombre `Bracket Mundial 2026`, idioma predeterminado Español (España),
  tipo App, **Gratuita**, aceptar declaraciones.

### 4. Ficha de Play Store (Store listing)
- Nombre (30 car.), descripción breve (80 car.), descripción completa (4000 car.) — textos ES y EN.
- Icono 512×512 PNG (reutilizar `public/icons/icon-512.png`).
- Gráfico destacado 1024×500.
- Capturas teléfono (mín. 2, 16:9 o 9:16) — con script de video/Playwright existente o capturas manuales.
- Categoría: Deportes. Datos de contacto (email del desarrollador), política de privacidad (URL pública requerida).

### 5. Configuración de la app (panel "Configurar la app")
- **Clasificación de contenido**: cuestionario IARC (deportes/predicciones, sin apuestas reales, sin violencia, sin contenido de usuario).
- **Público objetivo y contenido**: rango de edad; no está dirigida principalmente a niños.
- **Seguridad de los datos (Data safety)**: solo `INTERNET`; ningún dato recopilado/compartido (localStorage del dispositivo).
- **Anuncios**: "No contiene anuncios" (`@vercel/analytics` es analítica, no red de anuncios).
- **Permisos de APIs sensibles**: ninguno → no se requieren declaraciones adicionales.
- **App access**: sin login → "todas las funciones disponibles sin restricciones".

### 6. Producción/Testing — subir el AAB
- Empezar por **Pruebas internas** (track interno): crear lista de testers, subir `app-release.aab`, notas de versión.
- Verificar que Play acepta la firma y muestra el resumen del bundle.
- Opcional: promover a **Prueba cerrada** antes de Producción.

### 7. Precios y distribución
- App gratuita → sin configuración de pagos.
- Seleccionar países (recomendado: todos, o al menos ES + LatAm + países sede del Mundial).
- Aceptar directrices de contenido y leyes de exportación de EE. UU.

### 8. Envío a revisión (cuando la cuenta esté activa)
- Completar todas las secciones con check verde en el panel de publicación.
- Enviar para revisión. Tiempos típicos: pocas horas a ~7 días para apps nuevas.
- Sin APIs sensibles → sin retraso adicional por declaraciones especiales.

### 9. Checklist final y mantenimiento de releases
- Ver checklist accionable en [play-store-publish.md](play-store-publish.md).
- Futuras actualizaciones: subir `versionCode`, `versionName`, rebuild, subir nuevo AAB.

## Archivos

- **Guía completa:** [`docs/play-store-publish.md`](play-store-publish.md)
- **Build Android:** [`android/app/build.gradle`](../android/app/build.gradle)
- **Config Capacitor:** [`capacitor.config.ts`](../capacitor.config.ts)

## Verificación

- `docs/play-store-publish.md` cubre las 9 secciones con checklist accionable.
- `cd android && ./gradlew bundleRelease` produce `app-release.aab` sin error.
- La sección de APIs sensibles refleja que solo se usa `android.permission.INTERNET`.
