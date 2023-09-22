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
exports.CourseService = void 0;
const redis_1 = require("../../../utils/redis");
const courses_model_1 = require("./courses.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const mongoose_1 = __importDefault(require("mongoose"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../../../utils/sendMail"));
const notifications_model_1 = __importDefault(require("../notifications/notifications.model"));
const getSingleCourse = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCourse = yield redis_1.redis.get(id);
    if (isExistCourse) {
        const course = JSON.parse(isExistCourse);
        return course;
    }
    else {
        const result = yield courses_model_1.Course.findById(id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        yield redis_1.redis.set(id, JSON.stringify(result), "EX", 604800);
        return result;
    }
});
const getAllCourse = () => __awaiter(void 0, void 0, void 0, function* () {
    const isChaseExist = yield redis_1.redis.get("allCourses");
    if (isChaseExist) {
        const courses = JSON.parse(isChaseExist);
        return courses;
    }
    else {
        const result = yield courses_model_1.Course.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        yield redis_1.redis.set("allCourses", JSON.stringify(result));
        return result;
    }
});
const getCourseByUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userCourseList = (_a = req.user) === null || _a === void 0 ? void 0 : _a.courses;
    const courseExists = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.find((course) => course._id === String(id));
    if (!courseExists) {
        throw new ApiError_1.default(404, "You are not eligible to access this course");
    }
    const course = yield courses_model_1.Course.findById(id);
    const content = course === null || course === void 0 ? void 0 : course.courseData;
    return content;
});
//add question
const addQuestion = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { question, contentId, courseId } = req.body;
    const course = yield courses_model_1.Course.findById(courseId);
    if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const courseContent = (_b = course === null || course === void 0 ? void 0 : course.courseData) === null || _b === void 0 ? void 0 : _b.find((item) => item._id.equals(contentId));
    if (!courseContent) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const newQuestion = {
        user: req === null || req === void 0 ? void 0 : req.user,
        question,
        questionReply: [],
    };
    courseContent.questions.push(newQuestion);
    yield notifications_model_1.default.create({
        user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
        title: "New Question Received",
        message: `You have a new question in ${courseContent.title}`,
    });
    yield (course === null || course === void 0 ? void 0 : course.save());
    return course;
});
// add answer to question course
const addQuestionAnswer = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h;
    const { answer, courseId, contentId, questionId } = req.body;
    const course = yield courses_model_1.Course.findById(courseId);
    if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const courseContent = (_d = course === null || course === void 0 ? void 0 : course.courseData) === null || _d === void 0 ? void 0 : _d.find((item) => item._id.equals(contentId));
    if (!courseContent) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const question = (_e = courseContent === null || courseContent === void 0 ? void 0 : courseContent.questions) === null || _e === void 0 ? void 0 : _e.find((item) => item._id.equals(questionId));
    if (!question) {
        throw new ApiError_1.default(400, "Invalid question id");
    }
    const newAnswer = {
        user: req === null || req === void 0 ? void 0 : req.user,
        answer,
    };
    question.questionReplies.push(newAnswer);
    yield (course === null || course === void 0 ? void 0 : course.save());
    if (((_f = req.user) === null || _f === void 0 ? void 0 : _f._id) === ((_g = question.user) === null || _g === void 0 ? void 0 : _g._id)) {
        //create notification
        yield notifications_model_1.default.create({
            user: (_h = req.user) === null || _h === void 0 ? void 0 : _h._id,
            title: "New Question Reply Received",
            message: `You have a new question in ${courseContent.title}`,
        });
    }
    else {
        const data = {
            name: question.user.name,
            title: courseContent.title,
        };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/question-reply.ejs"), data);
        try {
            yield (0, sendMail_1.default)({
                email: question.user.email,
                subject: "Question Reply",
                template: "question-reply.ejs",
                data,
            });
        }
        catch (error) {
            throw new ApiError_1.default(500, `${error.message}`);
        }
    }
    return course;
});
//add review in course
const addReviewInCourse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    const { rating, review } = req.body;
    const userCourseList = (_j = req.user) === null || _j === void 0 ? void 0 : _j.courses;
    const courseId = req.params.id;
    //check exist course
    const courseExist = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.some((course) => course._id.toString() === courseId.toString());
    if (!courseExist) {
        throw new ApiError_1.default(400, "You are not eligible to access this course");
    }
    const course = yield courses_model_1.Course.findById(courseId);
    const reviewData = {
        user: req.user,
        rating,
        comment: review,
    };
    const reviews = ((course === null || course === void 0 ? void 0 : course.reviews) || []);
    reviews.push(reviewData);
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    if (course) {
        course.ratings = avg / reviews.length;
    }
    yield (course === null || course === void 0 ? void 0 : course.save());
    const notification = {
        title: "New review received",
        message: `${(_k = req.user) === null || _k === void 0 ? void 0 : _k.name} has given a review in ${course === null || course === void 0 ? void 0 : course.name}`,
    };
    return course;
});
const addReplyToReview = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    const { comment, courseId, reviewId } = req.body;
    const course = yield courses_model_1.Course.findById(courseId);
    const reviews = ((course === null || course === void 0 ? void 0 : course.reviews) || []);
    if (!course) {
        throw new ApiError_1.default(404, "Course not found");
    }
    const review = reviews === null || reviews === void 0 ? void 0 : reviews.find((rev) => rev._id.toString() === reviewId);
    if (!review) {
        throw new ApiError_1.default(404, "Review not found");
    }
    const replyData = {
        user: req.user,
        comment,
    };
    if (!review.commentReplies) {
        review.commentReplies = [];
    }
    (_l = review.commentReplies) === null || _l === void 0 ? void 0 : _l.push(replyData);
    yield (course === null || course === void 0 ? void 0 : course.save());
    return course;
});
//Get all Courses
const getAllCourses = () => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield courses_model_1.Course.find().sort({ createdAt: -1 });
    return courses;
});
//delete course  only for admin
const deleteCourse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield courses_model_1.Course.findById(id);
    if (!result) {
        throw new ApiError_1.default(404, "Course not found");
    }
    yield result.deleteOne({ id });
    yield redis_1.redis.del(id);
});
exports.CourseService = {
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
