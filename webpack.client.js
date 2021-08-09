const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const chalk = require('chalk');

module.exports = function (_env, argv) {
  const environment = argv && argv.mode === 'production' ? "production" : "development";
  console.log(chalk.cyanBright.bold(`Building [${environment.toUpperCase()}] Client...`));
  return {
    mode: environment,
    entry: './src/client/index.ts',
    devtool: "eval-source-map",
    devServer: {
      host: 'localhost',
      contentBase: path.join(__dirname, './assets'),
      compress: true,
      port: 80,
      writeToDisk: true,
    },
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
      // new CopyPlugin({
      //   patterns: [
      //     { from: "./src/client/assets/*", to: "assets/[name].[ext]" },
      //   ],
      // }),
    ],
  }
};
