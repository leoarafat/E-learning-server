"use strict";
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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
//Upload course
const uploadCourse = (0, catchAsync_1.default)(async (req, res) => {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
        const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
            folder: "Courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    const result = await courses_model_1.Course.create(data);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course created successfully`,
        data: result,
    });
});
//edit course
const editCourse = (0, catchAsync_1.default)(async (req, res) => {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const courseId = req.params.id;
    const courseData = (await courses_model_1.Course.findById(courseId));
    if (thumbnail && !thumbnail.startsWith("https")) {
        await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_url);
        const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
            folder: "Courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
    }
    const course = await courses_model_1.Course.findByIdAndUpdate(courseId, {
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
});
//get single course without purchase
const getSingleCourse = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await course_service_1.CourseService.getSingleCourse(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
});
//get all course without purchase
const getAllCourse = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.getAllCourse();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
});
//get all course only for valid user
const getCourseByUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.getCourseByUser(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Course retrieved successfully`,
        data: result,
    });
});
//add question
const addQuestion = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.addQuestion(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Question added successfully`,
        data: result,
    });
});
//add answer in course question
const addQuestionAnswer = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.addQuestionAnswer(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Question answer successfully`,
        data: result,
    });
});
//add review in course
const addReviewInCourse = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.addReviewInCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review added successfully`,
        data: result,
    });
});
//add reply in review
const addReplyToReview = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.addReplyToReview(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review reply added successfully`,
        data: result,
    });
});
//Get all courses
const getAllCourses = (0, catchAsync_1.default)(async (req, res) => {
    const result = await course_service_1.CourseService.getAllCourses();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Course retrieved successful",
        data: result,
    });
});
//Delete Course only for admin
const deleteCourse = (0, catchAsync_1.default)(async (req, res) => {
    await course_service_1.CourseService.deleteCourse(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Course deleted successful",
    });
});
const generateVideoUrl = (0, catchAsync_1.default)(async (req, res) => {
    const { videoId } = req.body;
    const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
        ttl: 300,
    }, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${config_1.default.video_cipher_api_key}`,
        },
    });
    console.log(response.data);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        data: response.data,
    });
});
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
    generateVideoUrl,
};
