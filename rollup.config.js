import esbuild from 'rollup-plugin-esbuild'
import { dts } from 'rollup-plugin-dts'
import { basename, join } from 'path'

/** @type {import('rollup').RollupOptions[]} */
const configs = []

function moduleName(input) {
  return basename(input, '.ts')
}
function dtsName(input) {
  return basename(input, '.ts') + '.d.ts'
}
function dtsInput(input) {
  return join('dist/modules', basename(input, '.ts') + '.d.ts')
}

export default [
  'src/core.ts',
  'src/valtio.ts',
].reduce((r, input) => r.concat([
  {
    input,
    output: [{
      file: `dist/mjs/${moduleName(input)}.mjs`,
      format: 'esm',
    }, {
      file: `dist/cjs/${moduleName(input)}.cjs`,
      format: 'cjs',
    }],
    plugins: [
      esbuild({
        target: 'es2018',
        supported: { 'import-meta': true },
      }),
    ],
  },
  {
    input: dtsInput(input),
    output: {
      file: 'dist/mjs/' + dtsName(input),
      format: 'esm',
    },
    plugins: [
      dts({
        tsconfig: './tsconfig.build.json',
      }),
    ],
  },
  {
    input: dtsInput(input),
    output: {
      file: 'dist/cjs/' + dtsName(input),
      format: 'cjs',
    },
    plugins: [
      dts({
        tsconfig: './tsconfig.build.json',
      }),
    ],
  },
]), configs)
