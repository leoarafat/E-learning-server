"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const layouts_controller_1 = require("./layouts.controller");
const user_controller_1 = require("../user/user.controller");
const router = express_1.default.Router();
router.post("/create-layout", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), layouts_controller_1.LayoutController.createLayout);
router.put("/update-layout", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), layouts_controller_1.LayoutController.updateLayout);
router.get("/get-layout/:type", layouts_controller_1.LayoutController.getLayoutByType);
exports.LayoutRoutes = router;
