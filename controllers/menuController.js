const { Menus } = require("../db/models");
const { Response, Error } = require("../helpers/response");
const redis = require("../middlewares/redis");

class MenuController {
  static async getAllMenus(req, res, next) {
    try {
      // check if data is already cached in Redis
      const cachedData = await redis.get("hangry:menus");
      if (cachedData) {
        const dataMenu = JSON.parse(cachedData);
        return new Response(res, 200, dataMenu);
      }

      //query find all from database
      const dataMenu = await Menus.findAll({});

      // check if there is any data
      if (dataMenu.length < 1) {
        throw new Error(400, "There is no menu yet");
      }

      // cached data for future use
      await redis.set("hangry:menus", JSON.stringify(dataMenu));

      return new Response(res, 200, dataMenu);
    } catch (error) {
      next(error);
    }
  }
  static async getMenuByID(req, res, next) {
    try {
      // extract id from req.params
      const id = req.params.id;
      // check if data is already cached in Redis
      const cachedData = await redis.get(`hangry:menusid${id}`);
      if (cachedData) {
        const dataMenu = JSON.parse(cachedData);
        return new Response(res, 200, dataMenu);
      }

      // search im database
      const dataMenu = await Menus.findOne({
        where: { id: id },
      });

      // validate if there is any data with specified ID
      if (!dataMenu) {
        throw new Error(400, `No menu with ID ${id}`);
      }
      // cached data for future use
      await redis.set(`hangry:menusid${id}`, JSON.stringify(dataMenu));

      return new Response(res, 200, dataMenu);
    } catch (error) {
      next(error);
    }
  }
  static async createMenu(req, res, next) {
    try {
      // extract input from req.body
      const { name, quantity, price, avatar } = req.body;

      // delete redis in-memory if changes is made
      await redis.del("hangry:menus");

      // create new menu
      const dataMenu = await Menus.create({
        userID: req.user.id,
        name: name,
        quantity: quantity,
        price: price,
        avatar: req.file?.path || null,
      });

      return new Response(res, 201, dataMenu);
    } catch (error) {
      next(error);
    }
  }
  static async updateMenu(req, res, next) {
    try {
      // extract input from req.body
      const { name, quantity, price, avatar } = req.body;
      const id = req.params.id;
      // find and validate if the menu exists
      const searchMenu = await Menus.findOne({
        where: { id: id },
      });
      if (!searchMenu) {
        throw new Error(400, `There is no menu with ID ${id}`);
      }

      // update menu with the input data
      const updateMenu = await Menus.update(
        {
          name: name,
          quantity: quantity,
          price: price,
          avatar: req.file?.path || searchMenu.avatar || null,
        },
        { where: { id: id } }
      );

      // delete redis in-memory if changes is made
      await redis.del(`hangry:menusid${id}`);
      await redis.del("hangry:menus");

      return new Response(res, 200, `Successfully update menu ID ${id}`);
    } catch (error) {
      next(error);
    }
  }
  static async deleteMenu(req, res, next) {
    try {
      // extract data from req.params
      const id = req.params.id;
      const searchUser = await Menus.findOne({
        where: { id: id },
      });
      // validate if the ID is match  with current data
      if (!searchUser) {
        throw new Error(400, `No menu with ID ${id}`);
      }
      
       // delete redis in-memory
       await redis.del(`hangry:menusid${id}`);
       await redis.del("hangry:menus");

      // delete menu
      const deleteUser = await Menus.destroy({
        where: { id: id },
      });

      return new Response(res, 200, "Menu deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MenuController;
