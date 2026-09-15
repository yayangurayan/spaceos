const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const srcIconDir = path.join(rootDir, 'src', 'icon');
const publicIconsDir = path.join(rootDir, 'public', 'icons');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

async function syncIcons() {
  console.log('🔄 Memproses ikon PWA dari src/icon...');

  const src192 = path.join(srcIconDir, 'spaceos-icon-192.webp');
  const src512 = path.join(srcIconDir, 'spaceos-icon-512.webp');

  if (!fs.existsSync(src192) || !fs.existsSync(src512)) {
    console.error('❌ Ikon sumber di src/icon tidak ditemukan!');
    process.exit(1);
  }

  // 1. Salin WebP asli ke public/icons/
  fs.copyFileSync(src192, path.join(publicIconsDir, 'spaceos-icon-192.webp'));
  fs.copyFileSync(src512, path.join(publicIconsDir, 'spaceos-icon-512.webp'));
  console.log('✅ Salin spaceos-icon-192.webp & spaceos-icon-512.webp ke public/icons/');

  // 2. Generate PNG standar 192x192 & 512x512
  await sharp(src192)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-192.png'));

  await sharp(src512)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-512.png'));
  console.log('✅ Generate icon-192.png & icon-512.png');

  // 3. Generate maskable icon dengan safe-zone padding (Android adaptive icon)
  // Safe zone untuk maskable adalah 80% di tengah (padding 10% di setiap sisi)
  const pad192 = Math.round(192 * 0.1);
  const inner192 = 192 - (pad192 * 2);
  const resized192 = await sharp(src192)
    .resize(inner192, inner192, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
    }
  })
    .composite([{ input: resized192, gravity: 'centre' }])
    .png()
    .toFile(path.join(publicIconsDir, 'icon-maskable-192.png'));

  const pad512 = Math.round(512 * 0.1);
  const inner512 = 512 - (pad512 * 2);
  const resized512 = await sharp(src512)
    .resize(inner512, inner512, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
    }
  })
    .composite([{ input: resized512, gravity: 'centre' }])
    .png()
    .toFile(path.join(publicIconsDir, 'icon-maskable-512.png'));
  console.log('✅ Generate icon-maskable-192.png & icon-maskable-512.png');

  // 4. Generate favicon.png
  await sharp(src192)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ Generate favicon.png');

  console.log('🎉 Semua aset ikon PWA siap di public/icons/!');
}

syncIcons().catch((err) => {
  console.error('Error memproses ikon:', err);
  process.exit(1);
});
