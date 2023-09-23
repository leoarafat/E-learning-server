import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";
import { UserController } from "../user/user.controller";

const router = express.Router();

router.get(
  "/get-all-notifications",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  NotificationController.getNotifications
);
router.put(
  "/update-notification/:id",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  NotificationController.updateNotification
);

export const NotificationRoutes = router;
