'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Menus.belongsTo(models.Users, { foreignKey: 'userID' });
      Menus.hasMany(models.CartMenus, { foreignKey: 'cartID' });
    }
  }
  Menus.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    avatar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Menus',
    timestamps: true,
    freezeTableName: true,
    paranoid: true
  });
  return Menus;
};