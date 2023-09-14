import express from "express";
import { UserController } from "./user.controller";
import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";

const router = express.Router();

router.post("/registration", UserController.registrationUser);
router.post("/activate-user", UserController.activateUser);
router.post("/login", UserController.loginUser);
router.get(
  "/logout",
  isAuthenticated(),

  UserController.logoutUser
);
router.get("/refresh-token", UserController.updateAccessToken);
router.get("/me", isAuthenticated(), UserController.getUserById);
export const UserRoutes = router;
