'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartMenus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartMenus.belongsTo(models.Carts, { foreignKey: 'cartID' });
      CartMenus.belongsTo(models.Menus, { foreignKey: 'menuID' });
    }
  }
  CartMenus.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    cartID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menuID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'CartMenus',
  });
  return CartMenus;
};