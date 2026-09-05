// One-off image optimization: resizes avatars down to what they're actually
// displayed at (max ~144px on screen, so 320px covers 2x retina with room to
// spare) and re-encodes at high compression. Keeps the same filenames/
// extensions so no code references need to change, and re-encodes each file
// in its OWN format (jpeg stays jpeg, png stays png) even if the extension
// doesn't match the actual bytes.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGETS = [
  { dir: path.join(__dirname, '..', 'public', 'waifu'), maxSize: 320 },
  { dir: path.join(__dirname, '..', 'public', 'mascot'), maxSize: 480 },
];

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { dir, maxSize } of TARGETS) {
    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const before = fs.statSync(filePath).size;
      const inputBuffer = fs.readFileSync(filePath);

      const image = sharp(inputBuffer).resize(maxSize, maxSize, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Encode based on the FILE'S ACTUAL bytes, not its extension —
      // some files here are mislabeled (e.g. a jpeg saved as .png).
      const meta = await sharp(inputBuffer).metadata();
      const buffer =
        meta.format === 'jpeg'
          ? await image.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
          : await image.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();

      const tmpPath = filePath + '.tmp';
      fs.writeFileSync(tmpPath, buffer);
      fs.rmSync(filePath, { force: true });
      fs.renameSync(tmpPath, filePath);

      const after = buffer.length;
      totalBefore += before;
      totalAfter += after;
      console.log(
        `${path.relative(process.cwd(), filePath)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
      );
    }
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
