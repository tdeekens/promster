const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const json = require('rollup-plugin-json');
const builtins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const filesize = require('rollup-plugin-filesize');

const env = process.env.NODE_ENV;
const name = process.env.npm_package_name;

const config = {
  output: {
    name,
    sourcemap: true,
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    globals(),
    builtins(),
    json(),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      preferBuiltins: true,
    }),
    commonjs({
      ignoreGlobal: true,
    }),
    filesize(),
  ],
};

module.exports = config;
