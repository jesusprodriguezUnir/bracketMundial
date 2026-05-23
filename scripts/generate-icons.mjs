import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const SOURCE_IMAGE = 'C:\\Users\\jesus\\.gemini\\antigravity\\brain\\5de23614-4e36-4449-94e4-840dbdd74338\\media__1779557680845.png';

async function generateIcons() {
  if (!existsSync(SOURCE_IMAGE)) {
    console.error(`❌ No se encontró la imagen de origen: ${SOURCE_IMAGE}`);
    process.exit(1);
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
