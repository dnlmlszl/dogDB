const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('READER', 'EDITOR', 'ADMIN'),
      defaultValue: 'EDITOR',
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.STRING,
    },
    // További mezők, mint email, stb.
  },
  {
    timestamps: true,
  }
);

module.exports = User;
