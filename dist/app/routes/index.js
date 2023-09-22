"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const courses_routes_1 = require("../modules/courses/courses.routes");
const order_routes_1 = require("../modules/order/order.routes");
const notification_routes_1 = require("../modules/notifications/notification.routes");
const analytics_routes_1 = require("../modules/analytics/analytics.routes");
const layouts_routes_1 = require("../modules/layouts/layouts.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/user",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/course",
        route: courses_routes_1.CourseRoutes,
    },
    {
        path: "/order",
        route: order_routes_1.OrderRoutes,
    },
    {
        path: "/notification",
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: "/analytics",
        route: analytics_routes_1.AnalyticsRoutes,
    },
    {
        path: "/layout",
        route: layouts_routes_1.LayoutRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
