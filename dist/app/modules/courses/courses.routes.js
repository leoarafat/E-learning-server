"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const courses_controller_1 = require("./courses.controller");
const router = express_1.default.Router();
router.post("/create-course", (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), courses_controller_1.CourseController.uploadCourse);
//get all course without purchases
router.get("/get-courses", courses_controller_1.CourseController.getAllCourse);
//get All courses for admin
router.get("/", (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), courses_controller_1.CourseController.getAllCourses);
router.put("/edit-course/:id", (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), courses_controller_1.CourseController.editCourse);
router.get("/get-course/:id", courses_controller_1.CourseController.getSingleCourse);
router.get("/get-course-content/:id", (0, auth_1.isAuthenticated)(), courses_controller_1.CourseController.getCourseByUser);
router.delete("/delete-course/:id", (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), courses_controller_1.CourseController.deleteCourse);
router.put("/add-question", (0, auth_1.isAuthenticated)(), courses_controller_1.CourseController.addQuestion);
router.put("/add-answer", (0, auth_1.isAuthenticated)(), courses_controller_1.CourseController.addQuestionAnswer);
router.put("/add-review/:id", (0, auth_1.isAuthenticated)(), courses_controller_1.CourseController.addReviewInCourse);
router.put("/add-reply", (0, auth_1.isAuthenticated)(), (0, auth_1.authorizedRoles)("admin"), courses_controller_1.CourseController.addReplyToReview);
exports.CourseRoutes = router;
