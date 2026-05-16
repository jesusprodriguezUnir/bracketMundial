# 🏆 Mundial 2026 - Bracket

Una aplicación web progresiva (PWA) de alto rendimiento diseñada para seguir y predecir los resultados de la Copa Mundial de la FIFA 2026. Construida con un enfoque mobile-first y una estética premium.

## 🚀 Tecnologías

Este proyecto utiliza un stack moderno y eficiente:

- **Core**: [Lit](https://lit.dev/) (Web Components ligeros y rápidos).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un desarrollo robusto y tipado.
- **Build Tool**: [Vite](https://vitejs.dev/) para una experiencia de desarrollo instantánea.
- **Backend**: [Firebase Data Connect](https://firebase.google.com/docs/data-connect) con PostgreSQL.
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) para soporte offline e instalación.
- **Estilos**: CSS nativo con variables para un sistema de diseño dinámico y cohesivo.

## ✨ Características

- **Algoritmo de Bracket Oficial**: Implementación exacta de las regulaciones de la FIFA para el Mundial 2026 (48 equipos).
- **Lógica Dinámica de Terceros**: Cálculo automático de los 8 mejores terceros y su asignación a los cruces de dieciseisavos (1/16) basada en las permutaciones oficiales.
- **Sincronización en Tiempo Real**: El árbol de eliminatorias se actualiza dinámicamente a medida que se ingresan o limpian los resultados de la fase de grupos.
- **Gestión de Resultados**: Posibilidad de ingresar marcadores o limpiar la información de un partido para revertir su impacto en las tablas y el bracket.
- **Noticias del Torneo**: Feed dinámico de noticias de Google News para cada equipo, en español e inglés, actualizado diariamente vía GitHub Actions.
- **PWA Ready**: Instalable en dispositivos móviles y funcional sin conexión.
- **UI Premium**: Diseño vibrante con estética retro tipo Panini, tipografías modernas y micro-animaciones.

## 📊 Lógica del Torneo (FIFA 2026)

Esta aplicación sigue fielmente el documento @[public/assets/docs/FWC26-regulations.pdf]:
- **Fase de Grupos**: 12 grupos de 4 equipos cada uno.
- **Clasificación**: Pasan los dos primeros de cada grupo y los 8 mejores terceros.
- **Dieciseisavos (1/16)**: Los cruces `M73` a `M88` se calculan dinámicamente. La aplicación utiliza un algoritmo de resolución de restricciones para asignar a los mejores terceros evitando que se enfrenten a rivales de su mismo grupo original, cumpliendo con los 495 posibles escenarios de clasificación.

## 🛠️ Configuración Local

### Requisitos Previos

- Node.js (versión recomendada v18 o superior)
- npm

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd bracketMundial
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

### Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Construcción para Producción

Para generar el bundle optimizado:
```bash
npm run build
```

## 📂 Estructura del Proyecto

- `src/`: Código fuente de la aplicación Lit.
- `dataconnect/`: Configuración y esquemas de Firebase Data Connect.
- `public/`: Activos estáticos.

---
Desarrollado con ❤️ para los fans del fútbol.
