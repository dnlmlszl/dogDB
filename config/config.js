require('dotenv').config();

const config = {
  development: {
    url: process.env.PSQL_EXTERNAL_URL,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    url: process.env.PSQL_EXTERNAL_URL,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

module.exports = config;
