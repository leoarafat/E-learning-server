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
router.get("/get-courses", CourseController.getAllCourse);
router.put(
  "/edit-course/:id",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.editCourse
);

router.get("/get-course/:id", CourseController.getSingleCourse);
router.get(
  "/get-course-content/:id",
  isAuthenticated(),
  CourseController.getCourseByUser
);
router.put("/add-question", isAuthenticated(), CourseController.addQuestion);
router.put(
  "/add-answer",
  isAuthenticated(),
  CourseController.addQuestionAnswer
);
export const CourseRoutes = router;
