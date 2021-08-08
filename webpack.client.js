const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const chalk = require('chalk');

module.exports = function (env, argv) {
  const environment = env && env.production ? "production" : "development";
  console.log(chalk.cyanBright.bold(`Building [${environment.toUpperCase()}] Client...`));
  return {
    mode: environment,
    entry: './src/client/index.ts',
    devtool: "eval-source-map",
    output: {
      path: path.resolve(__dirname, './dist/client'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: './src/client/index.html',
        favicon: "./src/client/favicon.ico",
      }),
    ],
  }
};
