const { Carts, CartMenus, Menus, sequelize } = require("../db/models");
const { Response, Error } = require("../helpers/response");

class CartController {
  static async getAllCarts(req, res, next) {
    try {
      //query find all from database
      const dataCart = await Carts.findAll({});

      // check if there is any data
      if (dataCart.length < 1) {
        throw new Error(400, "There is no cart yet");
      }
      return new Response(res, 200, dataCart);
    } catch (error) {
      next(error);
    }
  }
  static async getUserCart(req, res, next) {
    try {
      //query find all carts with the same userID as decoded token
      const dataCart = await Carts.findAll({
        where: { userID: req.user.id },
        include: {
          model: CartMenus,
        },
      });
      // check if there is any data
      if (dataCart.length < 1) {
        throw new Error(400, "This user has no cart yet");
      }
      return new Response(res, 200, dataCart);
    } catch (error) {
      next(error);
    }
  }
  static async createCart(req, res, next) {
    const t = await sequelize.transaction();
    try {
      // extract data from req.body
      const { menuID, quantity } = req.body;

      // using sequelize transaction as operation sequence
      const dataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );

      // check if menu available
      const checkMenu = await Menus.findOne(
        {
          where: { id: menuID },
        },
        { transaction: t }
      );

      if (!checkMenu) {
        throw new Error(400, "Menu not available");
      }

      // if the active cart is not exists, create new cart and cartMenu
      if (!dataCart) {
        const newCart = await Carts.create(
          {
            userID: req.user.id,
            totalPrice: quantity * checkMenu.price,
            completed: false,
          },
          { transaction: t }
        );
        const newCartMenu = await CartMenus.create(
          {
            cartID: newCart.id,
            menuID: menuID,
            quantity: quantity,
            price: checkMenu.price,
          },
          { transaction: t }
        );
      }

      // if the cart already exists
      if (dataCart) {
        // check in the cartMenus if the item already exists or not
        const cartMenus = await CartMenus.findOne(
          {
            where: {
              cartID: dataCart.id,
              menuID: menuID,
            },
          },
          { transaction: t }
        );

        // if not, create a new one
        if (!cartMenus) {
          const newCartMenu_ = await CartMenus.create(
            {
              cartID: dataCart.id,
              menuID: menuID,
              quantity: quantity,
              price: checkMenu.price,
            },
            { transaction: t }
          );
        }

        // if exists, update the cartMenus quantity and price
        if (cartMenus) {
          const updateCartMenus = await CartMenus.update(
            {
              quantity: quantity,
              price: cartMenus.price,
            },
            { where: { cartID: dataCart.id, menuID: menuID } },
            { transaction: t }
          );
        }
      }

      // save the sequence so every create and update operation could be read
      await t.commit();

      // generate new data from carts
      const newDataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );

      // update the cart data to the user
      const findCartMenus = await CartMenus.findAll(
        {
          where: {
            cartID: newDataCart.id,
          },
        },
        { transaction: t }
      );

      // calculate total price using reduce()
      const totalPrice = findCartMenus.reduce((acc, findCartMenus) => {
        return acc + findCartMenus.price * findCartMenus.quantity;
      }, 0);

      // update operation
      const updatedCart = await Carts.update(
        {
          totalPrice: totalPrice,
        },
        { where: { userID: req.user.id } },
        { transaction: t }
      );

      return new Response(res, 201, "Success add menu to cart");
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
  static async updateCart(req, res, next) {
    const t = await sequelize.transaction();
    try {
      // extract input data from req.body
      const { menuID, quantity } = req.body;

      // validate if the carts already exists
      const dataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );
      if (!dataCart) {
        throw new Error(400, "Invalid request as cart does not exists");
      }

      // validate if the user associated with the userID in the cart table
      if (dataCart.userID !== req.user.id) {
        throw new Error(403, "Unauthorized to make changes");
      }

      // check if menu available
      const checkMenu = await Menus.findOne(
        {
          where: { id: menuID },
        },
        { transaction: t }
      );
      if (!checkMenu) {
        throw new Error(400, "Menu not available");
      }

      // search if the menu already in the cart
      const searchMenu = await CartMenus.findOne(
        {
          where: {
            cartID: dataCart.id,
            menuID: menuID,
          },
        },
        { transaction: t }
      );
      if (searchMenu) {
        const updateCartMenus = await CartMenus.update(
          {
            quantity: quantity,
          },
          {
            where: {
              cartID: dataCart.id,
              menuID: menuID,
            },
          },
          { transaction: t }
        );
      }
      if (!searchMenu) {
        const newCartMenus = await CartMenus.create(
          {
            cartID: dataCart.id,
            menuID: menuID,
            price: checkMenu.price,
          },
          { transaction: t }
        );
      }

      // save any chagnges before updating the cart
      await t.commit();

      // generate new data from carts
      const newDataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );

      // update the cart data to the user
      const findCartMenus = await CartMenus.findAll(
        {
          where: {
            cartID: newDataCart.id,
          },
        },
        { transaction: t }
      );

      // calculate total price using reduce()
      const totalPrice = findCartMenus.reduce((acc, findCartMenus) => {
        return acc + findCartMenus.price * findCartMenus.quantity;
      }, 0);

      // update operation
      const updatedCart = await Carts.update(
        {
          totalPrice: totalPrice,
        },
        { where: { userID: req.user.id } },
        { transaction: t }
      );

      return new Response(res, 200, "Success update cart user");
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
  static async deleteCartMenus(req, res, next) {
    const t = await sequelize.transaction();
    try {
      // extract input data from req.body
      const menuID = req.params.id;

      // validate if the carts already exists
      const dataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );
      if (!dataCart) {
        throw new Error(400, "Invalid request as cart does not exists");
      }

      // validate if the user associated with the userID in the cart table
      if (dataCart.userID !== req.user.id) {
        throw new Error(403, "Unauthorized to make changes");
      }

      // validate if the menu exists in the cartMenus data
      const dataCartMenus = await CartMenus.findOne(
        {
          where: {
            cartID: dataCart.id,
            menuID: menuID,
          },
        },
        { transaction: t }
      );
      if (!dataCartMenus) {
        throw new Error(400, "Invalid request");
      }

      // delete the menu
      const deleteMenus = await CartMenus.destroy(
        {
          where: {
            cartID: dataCart.id,
            menuID: menuID,
          },
        },
        { transaction: t }
      );

      // save any changes before updating the cart
      await t.commit();

      // generate new data from carts
      const newDataCart = await Carts.findOne(
        {
          where: {
            userID: req.user.id,
            completed: false,
          },
        },
        { transaction: t }
      );

      // update the cart data to the user
      const findCartMenus = await CartMenus.findAll(
        {
          where: {
            cartID: newDataCart.id,
          },
        },
        { transaction: t }
      );

      // calculate total price using reduce()
      const totalPrice = findCartMenus.reduce((acc, findCartMenus) => {
        return acc + findCartMenus.price * findCartMenus.quantity;
      }, 0);

      // update operation
      const updatedCart = await Carts.update(
        {
          totalPrice: totalPrice,
        },
        { where: { userID: req.user.id } },
        { transaction: t }
      );

      return new Response(res, 200, "Success delete menu & update cart user");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;
