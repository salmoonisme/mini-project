const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { menuValidator } = require("../middlewares/joi");
const validation = require("../helpers/validation");
const { authUser, authAdmin } = require("../middlewares/authentication");
const multer = require("../middlewares/multer");

// endpoint for menu
router.get("/menu", menuController.getAllMenus);
router.get("/menu/:id", menuController.getMenuByID);
router.post("/menu", authAdmin, multer.single("avatar"), validation(menuValidator), menuController.createMenu);
router.patch("/menu/:id", authAdmin, multer.single("avatar"), menuController.updateMenu);
router.delete("/menu/:id", authAdmin, menuController.deleteMenu);

module.exports = router;
