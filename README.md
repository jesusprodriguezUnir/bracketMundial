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

- **Algoritmo de Bracket**: Gestión automática de las fases eliminatorias, incluyendo la lógica del tercer puesto.
- **PWA Ready**: Instalable en dispositivos móviles y funcional sin conexión.
- **Autenticación**: Integración con Google Authentication a través de Firebase.
- **UI Premium**: Diseño vibrante con estética "dark mode", tipografías modernas (Syne & Epilogue) y micro-animaciones.
- **Predicciones**: Interfaz interactiva para realizar y seguir predicciones de partidos.

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
