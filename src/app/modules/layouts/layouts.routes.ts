import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { LayoutController } from "./layouts.controller";

const router = express.Router();
router.post(
  "/create-layout",
  isAuthenticated(),
  authorizedRoles("admin"),
  LayoutController.createLayout
);
router.put(
  "/update-layout",
  isAuthenticated(),
  authorizedRoles("admin"),
  LayoutController.updateLayout
);
router.get(
  "/get-layout",

  LayoutController.getLayoutByType
);

export const LayoutRoutes = router;
