const nodeExternals = require('webpack-node-externals');
const path = require('path');
const chalk = require('chalk');

module.exports = function (_env, argv) {
  const environment = argv && argv.mode === 'production' ? "production" : "development";
  console.log(chalk.cyanBright.bold(`Building [${environment.toUpperCase()}] Server...`));
  return {
    mode: environment,
    externalsPresets: { node: true },
    entry: './src/server/index.ts',
    output: {
      library: 'App',
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './dist/server'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    externals: [nodeExternals({
      allowlist: [/^@geckos/]
    })],
    module: {
      rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
    },
  }
};