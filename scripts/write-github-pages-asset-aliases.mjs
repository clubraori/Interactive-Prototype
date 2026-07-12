import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const distRoot = process.argv[2];

if (!distRoot) {
  throw new Error("Usage: node scripts/write-github-pages-asset-aliases.mjs <dist-root>");
}

const assetsDir = path.resolve(distRoot, "assets");

const aliases = {
  "index.js": [
    "index-B7FzyquR.js",
    "index-CzArl_qA.js",
  ],
  "index.css": [
    "index-D6mCr95s.css",
    "index-DImp56av.css",
  ],
};

await mkdir(assetsDir, { recursive: true });

for (const [source, targetNames] of Object.entries(aliases)) {
  const sourcePath = path.join(assetsDir, source);

  for (const targetName of targetNames) {
    await copyFile(sourcePath, path.join(assetsDir, targetName));
  }
}
