import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { OrderController } from "./order.controller";

const router = express.Router();

router.post("/create-order", isAuthenticated(), OrderController.createOrder);
router.get(
  "/get-orders",
  isAuthenticated(),
  authorizedRoles("admin"),
  OrderController.getAllOrders
);

export const OrderRoutes = router;
