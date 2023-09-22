"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const courses_model_1 = require("./courses.model");
const course_service_1 = require("./course.service");
//Upload course
const uploadCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
            folder: "Courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    const result = yield courses_model_1.Course.create(data);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course created successfully`,
        data: result,
    });
}));
//edit course
const editCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
            folder: "Courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    const courseId = req.params.id;
    const course = yield courses_model_1.Course.findByIdAndUpdate(courseId, {
        $set: data,
    }, {
        new: true,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course updated successfully`,
        data: course,
    });
}));
//get single course without purchase
const getSingleCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield course_service_1.CourseService.getSingleCourse(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
}));
//get all course without purchase
const getAllCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.getAllCourse();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
}));
//get all course only for valid user
const getCourseByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.getCourseByUser(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
}));
//add question
const addQuestion = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.addQuestion(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Question added successfully`,
        data: result,
    });
}));
//add answer in course question
const addQuestionAnswer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.addQuestionAnswer(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Question answer successfully`,
        data: result,
    });
}));
//add review in course
const addReviewInCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.addReviewInCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review added successfully`,
        data: result,
    });
}));
//add reply in review
const addReplyToReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.addReplyToReview(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review reply added successfully`,
        data: result,
    });
}));
//Get all courses
const getAllCourses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield course_service_1.CourseService.getAllCourses();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Course retrieved successful",
        data: result,
    });
}));
//Delete Course only for admin
const deleteCourse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield course_service_1.CourseService.deleteCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Course deleted successful",
    });
}));
exports.CourseController = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourse,
    getCourseByUser,
    addQuestion,
    addQuestionAnswer,
    addReviewInCourse,
    addReplyToReview,
    getAllCourses,
    deleteCourse,
};
