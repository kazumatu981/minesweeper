import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASEDIR = './__tests__/debug';

const targets = (await fs.readdir('./__tests__/debug', { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
        return {
            entry: path.join(BASEDIR, entry.name, 'src', 'index.ts'),
            outdir: path.join(BASEDIR, entry.name, 'dist'),
        };
    });

const mineDebugBuildPromises = targets.map((target) => {
    return esbuild.build({
        entryPoints: [target.entry],
        entryNames: '[name].bundle',
        bundle: true,
        sourcemap: true,
        outdir: target.outdir,
    });
});

Promise.all(mineDebugBuildPromises);

// const mineDebugBuildPromise = esbuild.build({
//     entryPoints: ['./__tests__/debug/mine/src/mine.ts'],
//     entryNames: '[name].bundle',
//     bundle: true,
//     sourcemap: true,
//     outdir: './__tests__/debug/mine/dist',
// });
