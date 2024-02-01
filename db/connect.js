// db/connect.js nem változik, kivéve, hogy nem hoz létre új Sequelize példányt
const connectDB = async (sequelize) => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = connectDB;
