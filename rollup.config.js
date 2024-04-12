/* eslint-env node */

const resolve = require ('@rollup/plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const path = require('path');
const fs = require('fs');

import commonjs from '@rollup/plugin-commonjs';

const extensions = ['.js', '.ts'];

const secureWebVitalsLoader = require('./secureWebVitalsLoader');

const isDebugBuild = process.env.NODE_ENV !== 'production';

export default {
  input: 'lib/index.ts',
  output: {
    file: `target/${process.env.FILENAME}.js`,
    format: 'iife'
  },
  plugins: [
    babel(Object.assign(getBabelrc(), {
      babelrc: false,
      exclude: 'node_modules/**',
      extensions
    })),
    commonjs(),
    secureWebVitalsLoader(),
    replace({
      DEBUG: JSON.stringify(isDebugBuild)
    }),
    resolve({
      browser: true,
      extensions
    })
  ]
};


function getBabelrc() {
  const content = fs.readFileSync(path.join(__dirname, '.babelrc'), {encoding: 'utf8'});
  const config = JSON.parse(content);
  config.plugins = config.plugins
    // Rollup works with commonjs module. If we would transpile them, then rollup
    // could not do its job.
    .filter(plugin => plugin !== '@babel/plugin-transform-modules-commonjs');
  return config;
}
