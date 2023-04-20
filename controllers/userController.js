const { Users } = require("../db/models");
const { Response, Error } = require("../helpers/response");
const bcrypt = require("bcryptjs");
const { getToken, verifyToken } = require("../helpers/jwt");

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      //query find all from database
      const dataUser = await Users.findAll({});

      // check if there is any data
      if (dataUser.length < 1) {
        throw new Error(400, "There is no user yet");
      }
      return new Response(res, 200, dataUser);
    } catch (error) {
      next(error);
    }
  }
  static async getUserByID(req, res, next) {
    try {
      // extract id from req.params
      const id = req.params.id;
      const dataUser = await Users.findOne({
        where: { id: id },
      });

      // validate if there is any data with specified ID
      if (!dataUser) {
        throw new Error(400, `No user with ID ${req.params.id}`);
      }

      return new Response(res, 200, dataUser);
    } catch (error) {
      next(error);
    }
  }
  static async registerUser(req, res, next) {
    try {
      // extract input from req.body
      const { username, email, password, role } = req.body;
      const checkEmail = await Users.findOne({
        where: { email: email },
      });
      const checkUser = await Users.findOne({
        where: { username: username },
      });

      // validate if email or username already exists
      if (checkEmail) {
        throw new Error(400, "Email already exists");
      }
      if (checkUser) {
        throw new Error(400, "Username already exists");
      }

      // hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      const data = await Users.create({
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
      });
      return new Response(res, 201, {
        username: username,
        email: email,
      });
    } catch (error) {
      next(error);
    }
  }
  static async loginUser(req, res, next) {
    try {
      // extract input data from req.body
      const { email, password } = req.body;
      const checkEmail = await Users.findOne({ where: { email: email } });
      // search and validate if the email is registered or not
      if (!checkEmail) {
        throw new Error(401, `Email ${email} is not registered yet`);
      }

      // check decrypted password is matched with from database
      const passwordLogin = await bcrypt.compare(password, checkEmail.password);
      if (!passwordLogin) {
        throw new Error(401, "Invalid email or password");
      }
      const payload = {
        id: checkEmail.id,
        email: checkEmail.email,
        role: checkEmail.role,
      };
      const token = getToken(payload);
      return new Response(res, 200, token);
    } catch (error) {
      next(error);
    }
  }
  static async deleteUser(req, res, next) {
    try {
      // extract data from req.params
      const id = req.params.id;
      const searchUser = await Users.findOne({
        where: { id: id },
      });
      // validate if the ID is match  with current data
      if (!searchUser) {
        throw new Error(400, `No user with ID ${id}`);
      }
      // validate if the id from token matched the req.params
      if (searchUser.id !== req.user.id) {
        throw new Error(401, "Unauthorized to make changes");
      }
      // delete user
      const deleteUser = await Users.destroy({
        where: { id: id },
      });
      return new Response(res, 200, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
