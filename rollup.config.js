/* eslint-env node */

const resolve = require ('@rollup/plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const path = require('path');
const fs = require('fs');

const isDebugBuild = process.env.NODE_ENV !== 'production';

export default {
  input: 'lib/index.js',
  output: {
    file: `target/${process.env.FILENAME}.js`,
    format: 'iife'
  },
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: getPlugins()
    }),
    replace({
      DEBUG: JSON.stringify(isDebugBuild)
    }),
    resolve({
      browser: true
    })
  ]
};


function getPlugins() {
  const content = fs.readFileSync(path.join(__dirname, '.babelrc'), {encoding: 'utf8'});
  const config = JSON.parse(content);
  return config.plugins
    // Rollup works with commonjs module. If we would transpile them, then rollup
    // could not do its job.
    .filter(plugin => plugin !== '@babel/plugin-transform-modules-commonjs');
}
