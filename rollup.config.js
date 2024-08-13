import esbuild from 'rollup-plugin-esbuild'

/** @type {import('rollup').RollupOptions[]} */
const configs = []

const dist = 'dist'

export default [
  'src/valtio.ts',
  'src/core.ts',
].reduce((r, input) => r.concat([
  {
    input,
    output: [{
      dir: dist,
      format: 'esm',
      preserveModules: true,
      entryFileNames: '[name].mjs',
    }, {
      dir: dist,
      format: 'cjs',
      preserveModules: true,
      entryFileNames: '[name].cjs',
    }],
    plugins: [
      esbuild({
        target: 'es2015',
        supported: { 'import-meta': true },
      }),
    ],
  },
]), configs)
