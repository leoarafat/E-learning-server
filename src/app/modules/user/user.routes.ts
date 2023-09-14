import express from "express";
import { UserController } from "./user.controller";
const router = express.Router();

router.post("/registration", UserController.registrationUser);
router.post("/activate-user", UserController.activateUser);

export const UserRoutes = router;
