const { verifyToken } = require('../helpers/jwt');
const { Users } = require('../db/models');
const { Error } = require('../helpers/response');

// authentication and authorization for user
const authUser = async (req, res, next) => {
  try {
    // extract token from req.headers
    const token = req.headers.token;
    // put validation if there is a token or not
    if (!token) {
      throw new Error(401, 'Invalid token');
    }
    // decode token and search matching data in database
    const decodedToken = verifyToken(token);
    const user = await Users.findByPk(decodedToken.id);
    // validate the role
    if (!user || decodedToken.role !== 'user') {
      throw new Error(401, 'Unauthenticated');
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    // go to the next route or function
    next();
  } catch (error) {
    next(error);
  }
};

// authentication and authorization for admin
const authAdmin = async (req, res, next) => {
  try {
    // extract token from req.headers
    const token = req.headers.token;
    // put validation if there is a token or not
    if (!token) {
      throw new Error(401, 'Invalid token');
    }
    // decode token and search matching data in database
    const decodedToken = verifyToken(token);
    const user = await Users.findByPk(decodedToken.id);
    // validate the role
    if (!user || decodedToken.role !== 'admin') {
      throw new Error(401, 'Unauthenticated');
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    // go to the next route or function
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authAdmin, authUser };
