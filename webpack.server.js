const nodeExternals = require('webpack-node-externals');
const path = require('path');
const chalk = require('chalk');

module.exports = function (env/*, argv*/) {
  const environment = env && env.production ? "production" : "development";
  console.log(chalk.cyanBright.bold(`Building [${environment.toUpperCase()}] Server...`));
  return {
    mode: environment,
    target: 'node',
    entry: './src/server/index.ts',
    output: {
      path: path.resolve(__dirname, './dist/server'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    externals: [nodeExternals()],
    module: {
      rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
    },
  }
};