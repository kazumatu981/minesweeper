import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['./__tests__/ui-components/mine/src/mine.ts'],
    bundle: true,
    sourcemap: true,
    outfile: './__tests__/ui-components/mine/dist/mine.bundle.js',
});
