const replace = require('rollup-plugin-replace');
const flow = require('rollup-plugin-flow');

const isDebugBuild = process.env.NODE_ENV !== 'production';

export default {
  entry: 'lib/index.js',
  dest: `target/${process.env.FILENAME}.js`,
  format: 'iife',
  plugins:[
    flow(),
    replace({
      DEBUG: JSON.stringify(isDebugBuild)
    })
  ]
};
