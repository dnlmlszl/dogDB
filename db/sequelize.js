const { Sequelize } = require('sequelize');

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

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });

    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  initializeDatabase,
};
