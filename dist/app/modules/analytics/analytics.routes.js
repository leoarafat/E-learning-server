"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const analytics_controller_1 = require("./analytics.controller");
const user_controller_1 = require("../user/user.controller");
const router = express_1.default.Router();
router.get("/get-users-analytics", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), analytics_controller_1.AnalyticsController.getUsersAnalytics);
router.get("/get-courses-analytics", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), analytics_controller_1.AnalyticsController.getCourseAnalytics);
router.get("/get-orders-analytics", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), analytics_controller_1.AnalyticsController.getOrdersAnalytics);
exports.AnalyticsRoutes = router;
