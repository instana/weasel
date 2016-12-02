/* eslint-env node */

const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const path = require('path');
const fs = require('fs');

const isDebugBuild = process.env.NODE_ENV !== 'production';

export default {
  entry: 'lib/index.js',
  dest: `target/${process.env.FILENAME}.js`,
  format: 'iife',
  plugins:[
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: getPlugins()
    }),
    replace({
      DEBUG: JSON.stringify(isDebugBuild)
    })
  ]
};


function getPlugins() {
  const content = fs.readFileSync(path.join(__dirname, '.babelrc'), {encoding: 'utf8'});
  const config = JSON.parse(content);
  return config.plugins
    .filter(plugin => plugin !== 'transform-es2015-modules-commonjs');
}
