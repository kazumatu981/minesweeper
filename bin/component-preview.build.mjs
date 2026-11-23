import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASEDIR = './__tests__/component-preview';

const targets = (await fs.readdir(BASEDIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
        return {
            entry: path.join(BASEDIR, entry.name, 'src', 'index.ts'),
            outdir: path.join(BASEDIR, entry.name, 'dist'),
        };
    });

const componentPreviewBuildPromises = targets.map((target) => {
    return esbuild.build({
        entryPoints: [target.entry],
        entryNames: '[name].bundle',
        bundle: true,
        sourcemap: true,
        outdir: target.outdir,
    });
});

Promise.all(componentPreviewBuildPromises);
