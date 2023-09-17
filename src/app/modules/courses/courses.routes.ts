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
//get all course without purchases
router.get("/get-courses", CourseController.getAllCourse);
//get All courses for admin
router.get(
  "/",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.getAllCourses
);
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
router.delete(
  "/delete-course/:id",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.deleteCourse
);
router.put("/add-question", isAuthenticated(), CourseController.addQuestion);
router.put(
  "/add-answer",
  isAuthenticated(),
  CourseController.addQuestionAnswer
);
router.put(
  "/add-review/:id",
  isAuthenticated(),
  CourseController.addReviewInCourse
);
router.put(
  "/add-reply",
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.addReplyToReview
);
export const CourseRoutes = router;
