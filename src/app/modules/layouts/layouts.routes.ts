import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { LayoutController } from "./layouts.controller";
import { UserController } from "../user/user.controller";

const router = express.Router();
router.post(
  "/create-layout",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  LayoutController.createLayout
);
router.put(
  "/update-layout",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  LayoutController.updateLayout
);
router.get(
  "/get-layout/:type",

  LayoutController.getLayoutByType
);

export const LayoutRoutes = router;
