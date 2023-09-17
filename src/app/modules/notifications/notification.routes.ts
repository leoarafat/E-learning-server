import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();

router.get(
  "/get-all-notifications",
  isAuthenticated(),
  authorizedRoles("admin"),
  NotificationController.getNotifications
);
router.put(
  "/update-notification/:id",
  isAuthenticated(),
  authorizedRoles("admin"),
  NotificationController.updateNotification
);

export const NotificationRoutes = router;
