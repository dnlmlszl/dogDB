const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');
const User = require('./User');
const DogBreed = require('./DogBreed');

const Dog = sequelize.define(
  'Dog',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    breedId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'DogBreeds',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Dog;
