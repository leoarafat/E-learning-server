import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { AnalyticsController } from "./analytics.controller";
import { UserController } from "../user/user.controller";

const router = express.Router();

router.get(
  "/get-users-analytics",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getUsersAnalytics
);
router.get(
  "/get-courses-analytics",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getCourseAnalytics
);
router.get(
  "/get-orders-analytics",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getOrdersAnalytics
);

export const AnalyticsRoutes = router;
