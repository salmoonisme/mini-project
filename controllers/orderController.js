const { Carts, CartMenus, Menus, sequelize, Orders } = require("../db/models");
const { Response, Error } = require("../helpers/response");
const redis = require("../middlewares/redis");

class OrderController {
  static async getAllOrders(req, res, next) {
    try {
      //query find all from database
      const dataCart = await Orders.findAll({});

      // check if there is any data
      if (dataCart.length < 1) {
        throw new Error(400, "There is no order yet");
      }
      return new Response(res, 200, dataCart);
    } catch (error) {
      next(error);
    }
  }
  static async getOrderByID(req, res, next) {
    try {
      //query find all carts with the same userID as decoded token
      const id = req.user.id;
      const dataCart = await Orders.findAll({
        where: { userID: id },
      });
      // check if there is any data
      if (dataCart.length < 1) {
        throw new Error(400, "This user has no order yet");
      }
      return new Response(res, 200, dataCart);
    } catch (error) {
      next(error);
    }
  }
  static async createOrder(req, res, next) {
    const t = await sequelize.transaction();
    try {
      // extract data from req.body and find if the cart exists
      const { cartID } = req.body;
      const findCart = await Carts.findOne(
        {
          where: {
            id: cartID,
            completed: false,
          },
        },
        { transaction: t }
      );
      // validate the cart existence
      if (!findCart) {
        throw new Error(400, "Cart is not found");
      }

      // validate if the user associated with the userID in the cart table
      if (findCart.userID !== req.user.id) {
        throw new Error(403, "Unauthorized");
      }

      // create order if the data is valid
      const createOrder = await Orders.create(
        {
          userID: req.user.id,
          cartID: findCart.id,
          totalPrice: findCart.totalPrice,
          completed: false,
        },
        { transaction: t }
      );

      // track all the menus in the associated cartID
      const allMenuOrder = await CartMenus.findAll(
        {
          where: {
            cartID: cartID,
          },
        },
        { transaction: t }
      );

      // when order is made, make sure to deduct quantity in the menu table
      for (const menu of allMenuOrder) {
        const searchMenu = await Menus.findOne(
          {
            where: { id: menu.menuID },
          },
          { transaction: t }
        );
        const menuCart = await CartMenus.findOne(
          {
            where: { cartID: cartID, menuID: searchMenu.id },
          },
          { transaction: t }
        );
        // make sure to delete redis in specific menu ID
        await redis.del(`hangry:menusid${searchMenu.id}`);
        const newQuantity = searchMenu.quantity - menuCart.quantity;
        if (newQuantity < 0) throw new Error(400, "Not enough inventory");
        const updateMenu = await Menus.update(
          {
            quantity: searchMenu.quantity - menuCart.quantity,
          },
          { where: { id: searchMenu.id } },
          { transaction: t }
        );
      }

      // update carts to be completed
      const updateCart = await Carts.update(
        {
          completed: true,
        },
        {
          where: {
            id: cartID,
          },
        }
      );
      await redis.del("hangry:menus");

      // save sequence changes
      await t.commit();

      return new Response(res, 201, "Success create order");
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
  static async payOrder(req, res, next) {
    try {
      // extract order ID from req.params
      const id = req.params.id;

      // validate if the order exists
      const searchOrder = await Orders.findOne({
        where: {
          id: id,
          completed: false,
        },
      });
      if (!searchOrder) {
        throw new Error(400, "Order not found");
      }

      // validate if the user associated with the userID in the cart table
      if (searchOrder.userID !== req.user.id) {
        throw new Error(403, "Unauthorized");
      }

      // if exists proceed to pay order and update the data
      const updateOrder = await Orders.update(
        {
          completed: true,
        },
        { where: { id: id } }
      );
      return new Response(res, 200, 'Success pay order')

    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
