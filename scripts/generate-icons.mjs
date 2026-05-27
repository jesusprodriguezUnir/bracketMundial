import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// La imagen de origen puede colocarse en public/icons/icon-source.png si se desea regenerar
const SOURCE_IMAGE = join(rootDir, 'public', 'icons', 'icon-source.png');

async function generateIcons() {
  if (!existsSync(SOURCE_IMAGE)) {
    // Si no hay imagen de origen personalizada, simplemente usamos los iconos ya existentes en public/
    const requiredIcon = join(rootDir, 'public', 'icons', 'icon-512.png');
    if (existsSync(requiredIcon)) {
      console.log('ℹ️ Iconos PWA existentes detectados en public/icons/. Se omite la regeneración.');
      process.exit(0);
    }
    console.warn(`⚠️ Warning: No se encontró la imagen de origen: ${SOURCE_IMAGE}`);
    console.warn('Se omitirá la regeneración y se utilizarán los iconos existentes en public/');
    process.exit(0);
  }

  console.log(`🔷 Procesando imagen de origen: ${SOURCE_IMAGE}`);

  const targets = [
    { path: join(rootDir, 'public', 'icons', 'icon-512.png'), size: 512 },
    { path: join(rootDir, 'public', 'icons', 'icon-192.png'), size: 192 },
    { path: join(rootDir, 'public', 'icons', 'icon-512-maskable.png'), size: 512 },
    { path: join(rootDir, 'public', 'apple-touch-icon.png'), size: 180 },
    { path: join(rootDir, 'public', 'apple-launch.png'), size: 512 },
  ];

  for (const target of targets) {
    try {
      if (target.path.includes('maskable')) {
        // PWA maskable icon: agregamos un fondo o margen
        // Para simplificar, la imagen circular ya tiene suficiente aire, la redimensionamos con un pequeño padding
        await sharp(SOURCE_IMAGE)
          .resize(target.size, target.size, {
            fit: 'contain',
            background: { r: 236, g: 223, b: 192, alpha: 1 } // fondo crema #ecdfc0 de la app
          })
          .png()
          .toFile(target.path);
      } else {
        await sharp(SOURCE_IMAGE)
          .resize(target.size, target.size, { fit: 'cover' })
          .png()
          .toFile(target.path);
      }
      console.log(`   ✅ Generado: ${target.path} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`   ❌ Error al generar ${target.path}:`, err.message);
    }
  }

  console.log('🎉 Todos los iconos estáticos generados correctamente.');
}

generateIcons();
