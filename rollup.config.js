import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import { name, index as input, main as cjs, unpkg as umd, module as es } from './package.json';

const outputs = [
  { file: cjs, format: 'cjs' },
  { file: es, format: 'es' },
  { file: es.replace(/.js$/, '.mjs'), format: 'es' },
  { file: umd, format: 'umd', name },
];

const commonOptions = {
  exports: 'named',
};

export default {
  input,
  output: outputs.map(output => ({ ...commonOptions, ...output })),
  plugins: [
    typescript(),
    nodeResolve(),
  ],
}
