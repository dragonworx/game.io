require('./dist/server/bundle.js');

const chalk = require('chalk');
const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => res.redirect('./index.html'));

app.use(express.static('./dist/client'));

app.listen(port, () =>
  console.log(chalk.bright.cyan(`Example app listening at http://localhost:${port}`))
);