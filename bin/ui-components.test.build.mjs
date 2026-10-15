import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: [
        './__tests__/ui-components/mine/src/mine.ts',
        './__tests__/ui-components/mine/src/mine-field.ts',
    ],
    entryNames: '[name].bundle',
    bundle: true,
    sourcemap: true,
    outdir: './__tests__/ui-components/mine/dist',
});
