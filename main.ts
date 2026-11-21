// AURELIA — The Poster for a Place That Isn't There.
// Writes the travel poster image to $MAKEFUN_OUTPUT_DIR/entry.png
// (default /output/entry.png) and verifies it byte-for-byte.
//
// The poster: a floating archipelago of golden islands above a sea of
// clouds at dusk, one tall crystal lighthouse on the main island catching
// the last light. The place name AURELIA is the only text in the image.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(sourcePath, outPath);

// Verify: PNG magic bytes, then byte-for-byte identity with the source.
const written = readFileSync(outPath);
const source = readFileSync(sourcePath);

if (!written.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("output is not a PNG (bad magic bytes)");
}
// The PNG's IHDR chunk (bytes 16-23) carries width and height, big-endian.
const width = written.readUInt32BE(16);
const height = written.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`output is ${width}x${height}, the gate needs 1024x1024`);
}
if (!written.equals(source)) {
  throw new Error("output differs from entry.png");
}
if (written.length > 1_048_576) {
  throw new Error(`output is ${written.length} bytes, over the 1 MiB cap`);
}

console.log(`wrote ${outPath} (${written.length} bytes, PNG verified)`);
