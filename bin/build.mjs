import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';

const TARGET = './src/index.ts';
const OUT_DIR = './dist';
const MAP_FILE = './dist/index.bundle.js.map';

const mode = process.argv[2] === undefined ? 'debug' : process.argv[2];

if (mode === 'clean') {
    await fs.rm(OUT_DIR, { recursive: true, force: true });
    process.exit(0);
}

const isRelease = mode === 'release';

if (isRelease) {
    await fs.rm(MAP_FILE, { force: true });
}

await esbuild.build({
    entryPoints: [TARGET],
    entryNames: '[name].bundle',
    bundle: true,
    platform: 'browser',
    format: 'esm',
    minify: isRelease,
    sourcemap: isRelease ? false : true,
    drop: isRelease ? ['console', 'debugger'] : [],
    outdir: OUT_DIR,
});
