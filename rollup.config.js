import esbuild from 'rollup-plugin-esbuild'
import { dts } from 'rollup-plugin-dts'
import { basename, join } from 'path'

/** @type {import('rollup').RollupOptions[]} */
const configs = []

const dist = 'dist'

function moduleName(input) {
  return basename(input, '.ts')
}
function dtsInput(input) {
  return join(dist, 'types', basename(input, '.ts') + '.d.ts')
}

export default [
  'src/core.ts',
  'src/valtio.ts',
].reduce((r, input) => r.concat([
  {
    input,
    output: [{
      file: `${dist}/${moduleName(input)}.mjs`,
      format: 'esm',
    }, {
      file: `${dist}/${moduleName(input)}.cjs`,
      format: 'cjs',
    }],
    plugins: [
      esbuild({
        target: 'es2015',
        supported: { 'import-meta': true },
      }),
    ],
  },
  {
    input: dtsInput(input),
    output: [{
      file: `${dist}/${moduleName(input)}.d.ts`,
      format: 'cjs',
    }, {
      file: `${dist}/${moduleName(input)}.d.mts`,
      format: 'esm',
    }],
    plugins: [
      dts(),
    ],
  },
]), configs)
