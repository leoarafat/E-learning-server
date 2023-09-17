import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/get-users-analytics",
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getUsersAnalytics
);
router.get(
  "/get-courses-analytics",
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getCourseAnalytics
);
router.get(
  "/get-orders-analytics",
  isAuthenticated(),
  authorizedRoles("admin"),
  AnalyticsController.getOrdersAnalytics
);

export const AnalyticsRoutes = router;
