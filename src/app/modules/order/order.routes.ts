import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { OrderController } from "./order.controller";
import { UserController } from "../user/user.controller";

const router = express.Router();

router.post("/create-order", isAuthenticated(), OrderController.createOrder);
router.get(
  "/get-orders",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  OrderController.getAllOrders
);
router.get(
  "/payment/stripepublishablekey",
  OrderController.sendStripePublishableKey
);
router.post("/payment", isAuthenticated(), OrderController.newPayment);

export const OrderRoutes = router;
