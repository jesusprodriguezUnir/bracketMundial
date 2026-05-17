# Guía: Optimización Móvil y Generación de APK (Android)

Esta guía detalla las optimizaciones implementadas en la PWA (Progressive Web App) para mejorar la experiencia en dispositivos móviles, así como los pasos exactos para generar una APK nativa para Android usando Capacitor y Android Studio.

## 1. Optimizaciones Móviles Implementadas

La aplicación ya cuenta con varias mejoras clave para sentirse como una app nativa:
- **Viewport Configurado:** `viewport-fit=cover` en el `index.html` para extender el contenido por toda la pantalla.
- **Safe Area Insets:** Márgenes dinámicos en el `body` (`env(safe-area-inset-*)`) dentro de `index.css` para evitar que el "notch" o la barra de navegación tapen la interfaz.
- **Tap Highlight Desactivado:** Se usa `-webkit-tap-highlight-color: transparent` para eliminar el destello azul al tocar elementos, dando una sensación de aplicación nativa.
- **Áreas Táctiles Optimizadas:** Los botones tienen un `min-height` de 44px para facilitar la interacción táctil.

## 2. Pasos para Generar la APK de Android

El proyecto utiliza **Capacitor** para empaquetar la PWA en un contenedor nativo. Sigue estos pasos para obtener tu archivo `.apk`:

### Requisitos Previos
1. Descarga e instala [Android Studio](https://developer.android.com/studio).
2. Abre Android Studio al menos una vez para que descargue e instale los SDKs predeterminados de Android.

### Compilación y Sincronización
Abre tu terminal en la raíz del proyecto (`d:\Personal\bracketMundial`) y ejecuta el siguiente comando:

```bash
npm run android
```

**¿Qué hace este comando?**
- `npm run build`: Compila la aplicación web con Vite.
- `npx cap sync`: Copia los archivos estáticos generados al proyecto nativo de Android.
- `npx cap open android`: Abre el proyecto automáticamente dentro de Android Studio.

### Generación en Android Studio
1. Una vez abierto **Android Studio**, espera pacientemente. En la parte inferior verás que dice "Gradle Build Running" o "Syncing". Es fundamental **esperar a que este proceso termine** completamente.
2. Cuando la sincronización finalice, dirígete al menú superior y selecciona:
   **`Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`**
3. Android Studio comenzará a compilar la aplicación. Este proceso puede tardar un par de minutos.
4. Al terminar, aparecerá una notificación en la esquina inferior derecha con el mensaje *"Build APK(s) successfully"*.
5. Haz clic en el enlace **`locate`** de esa misma notificación.
6. Se abrirá el explorador de archivos mostrando tu archivo **`app-debug.apk`**.

¡Listo! Ya puedes copiar este archivo `.apk` a tu dispositivo Android, instalarlo y probar la aplicación como si fuera nativa.

> **Nota para Producción:** El archivo generado es para propósitos de prueba (Debug). Si deseas subir la aplicación a la Google Play Store, en el paso 2 de "Generación en Android Studio" deberás seleccionar **`Build` > `Generate Signed Bundle / APK...`**, elegir "Android App Bundle" y crear/proporcionar un Keystore para firmar tu aplicación.
