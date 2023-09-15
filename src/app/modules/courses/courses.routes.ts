import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { CourseController } from "./courses.controller";

const router = express.Router();

router.post(
  "/create-course",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.uploadCourse
);
router.put(
  "/edit-course/:id",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.editCourse
);

export const CourseRoutes = router;
