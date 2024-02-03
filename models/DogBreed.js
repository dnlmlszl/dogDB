const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const Dog = require('./Dog');

const DogBreed = sequelize.define(
  'DogBreed',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provisional: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    pdf: {
      type: DataTypes.STRING,
    },
    dogId: {
      type: DataTypes.UUID,
      references: {
        model: 'Dogs',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = DogBreed;
