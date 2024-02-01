require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
const port = process.env.PORT || 3000;

const sequelize = new Sequelize(process.env.PSQL_EXTERNAL_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .sync()
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.log('Error connecting to database');
    console.log(err);
  });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
