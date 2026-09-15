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

function createIcoBuffer(pngBuffer, size = 48) {
  // Binary ICO format embedding PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(1, 4); // count: 1 icon

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // width
  entry.writeUInt8(size, 1); // height
  entry.writeUInt8(0, 2);    // color count
  entry.writeUInt8(0, 3);    // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6);// bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // image size in bytes
  entry.writeUInt32LE(22, 12); // image offset (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer]);
}

async function syncIcons() {
  console.log('🔄 Memproses ikon PWA & Favicon dari src/icon...');

  const src192 = path.join(srcIconDir, 'spaceos-icon-192.webp');
  const src512 = path.join(srcIconDir, 'spaceos-icon-512.webp');

  if (!fs.existsSync(src192) || !fs.existsSync(src512)) {
    console.error('❌ Ikon sumber di src/icon tidak ditemukan!');
    process.exit(1);
  }

  // 1. Salin WebP asli ke public/icons/ dan public/
  fs.copyFileSync(src192, path.join(publicIconsDir, 'spaceos-icon-192.webp'));
  fs.copyFileSync(src512, path.join(publicIconsDir, 'spaceos-icon-512.webp'));
  fs.copyFileSync(src192, path.join(publicDir, 'favicon.webp'));
  console.log('✅ Salin spaceos-icon-192.webp & spaceos-icon-512.webp');

  // 2. Generate PNG standar 192x192 & 512x512
  await sharp(src192)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-192.png'));

  await sharp(src512)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-512.png'));
  console.log('✅ Generate icon-192.png & icon-512.png');

  // 3. Generate maskable icon langsung dari icon pengguna (asli tanpa border buatan)
  await sharp(src192)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-maskable-192.png'));

  await sharp(src512)
    .png({ quality: 100 })
    .toFile(path.join(publicIconsDir, 'icon-maskable-512.png'));
  console.log('✅ Generate icon-maskable-192.png & icon-maskable-512.png');

  // 4. Generate favicon.png (48x48 & 32x32)
  const fav48 = await sharp(src192).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), fav48);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), fav48);

  const fav32 = await sharp(src192).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32);
  console.log('✅ Generate favicon.png, favicon-48x48.png, favicon-32x32.png');

  // 5. Generate favicon.ico biner valid
  const icoBuffer = createIcoBuffer(fav48, 48);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✅ Generate favicon.ico');

  // 6. Generate favicon.svg dengan embedding icon pengguna
  const b64 = (await sharp(src192).resize(128, 128).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="128" height="128"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('✅ Generate favicon.svg dari icon pengguna');

  console.log('🎉 Seluruh aset Favicon & PWA berhasil disinkronkan!');
}

syncIcons().catch((err) => {
  console.error('Error memproses ikon:', err);
  process.exit(1);
});
