const ServerApp = require('./dist/server/bundle.js').App.default;

const chalk = require('chalk');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const port = process.argv.length >= 3 ? parseInt(process.argv[2]) : 80;

const indexHtml = fs.readFileSync(path.resolve(__dirname, './dist/client/index.html')).toString();

const gameApp = new ServerApp(port + 1);

// app.get('/', (_req, res) => res.redirect('./index.html'));
app.get('/', (_req, res) => {
  res.send(indexHtml);
});
app.get('/reset', (_req, res) => {
  gameApp.reset();
  res.redirect('/');
})

app.use(express.static('./dist/client'));
app.use(express.static('./assets'));

app.listen(port, () =>
  console.log(chalk.cyanBright.bold(`Example app listening at http://localhost:${port}`))
);
