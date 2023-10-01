"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const notification_controller_1 = require("./notification.controller");
const user_controller_1 = require("../user/user.controller");
const router = express_1.default.Router();
router.get("/get-all-notifications", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), notification_controller_1.NotificationController.getNotifications);
router.put("/update-notification/:id", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), notification_controller_1.NotificationController.updateNotification);
exports.NotificationRoutes = router;
