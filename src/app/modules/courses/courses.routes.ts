import express from "express";

import { authorizedRoles, isAuthenticated } from "../../middlewares/auth";
import { CourseController } from "./courses.controller";
import { UserController } from "../user/user.controller";

const router = express.Router();

router.post(
  "/create-course",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.uploadCourse
);
//get all course without purchases
router.get("/get-courses", CourseController.getAllCourse);
//get All courses for admin
router.get(
  "/",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.getAllCourses
);
router.put(
  "/edit-course/:id",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.editCourse
);

router.get("/get-course/:id", CourseController.getSingleCourse);
router.get(
  "/get-course-content/:id",
  UserController.updateAccessToken,
  isAuthenticated(),
  CourseController.getCourseByUser
);
router.delete(
  "/delete-course/:id",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.deleteCourse
);
router.put("/add-question", isAuthenticated(), CourseController.addQuestion);
router.put(
  "/add-answer",
  UserController.updateAccessToken,
  isAuthenticated(),
  CourseController.addQuestionAnswer
);
router.put(
  "/add-review/:id",
  UserController.updateAccessToken,
  isAuthenticated(),
  CourseController.addReviewInCourse
);
router.post(
  "/getVdoCipherOTP",

  CourseController.generateVideoUrl
);
router.put(
  "/add-reply",
  UserController.updateAccessToken,
  isAuthenticated(),
  authorizedRoles("admin"),
  CourseController.addReplyToReview
);
export const CourseRoutes = router;
