"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const order_controller_1 = require("./order.controller");
const user_controller_1 = require("../user/user.controller");
const router = express_1.default.Router();
router.post("/create-order", (0, auth_1.isAuthenticated)(), order_controller_1.OrderController.createOrder);
router.get("/get-orders", user_controller_1.UserController.updateAccessToken, (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), order_controller_1.OrderController.getAllOrders);
router.get("/payment/stripepublishablekey", order_controller_1.OrderController.sendStripePublishableKey);
router.post("/payment", (0, auth_1.isAuthenticated)(), order_controller_1.OrderController.newPayment);
exports.OrderRoutes = router;
