"use strict";
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
const getSingleCourse = async (id) => {
    const isExistCourse = await redis_1.redis.get(id);
    if (isExistCourse) {
        const course = JSON.parse(isExistCourse);
        return course;
    }
    else {
        const result = await courses_model_1.Course.findById(id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        await redis_1.redis.set(id, JSON.stringify(result), "EX", 604800);
        return result;
    }
};
const getAllCourse = async () => {
    const result = await courses_model_1.Course.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
    return result;
};
const getCourseByUser = async (req) => {
    const { id } = req.params;
    // console.log(id );
    const userCourseList = req.user?.courses;
    const courseExists = userCourseList?.find((course) => course._id === String(id));
    // console.log(courseExists);
    if (!courseExists) {
        throw new ApiError_1.default(404, "You are not eligible to access this course");
    }
    const course = await courses_model_1.Course.findById(id);
    const content = course?.courseData;
    return content;
};
//add question
const addQuestion = async (req) => {
    const { question, contentId, courseId } = req.body;
    const course = await courses_model_1.Course.findById(courseId);
    if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
    if (!courseContent) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const newQuestion = {
        user: req?.user,
        question,
        questionReply: [],
    };
    courseContent.questions.push(newQuestion);
    await notifications_model_1.default.create({
        user: req.user?._id,
        title: "New Question Received",
        message: `You have a new question in ${courseContent.title}`,
    });
    await course?.save();
    return course;
};
// add answer to question course
const addQuestionAnswer = async (req) => {
    const { answer, courseId, contentId, questionId } = req.body;
    const course = await courses_model_1.Course.findById(courseId);
    if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
    if (!courseContent) {
        throw new ApiError_1.default(400, "Invalid content id");
    }
    const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
    if (!question) {
        throw new ApiError_1.default(400, "Invalid question id");
    }
    const newAnswer = {
        user: req?.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    question.questionReplies.push(newAnswer);
    await course?.save();
    if (req.user?._id === question.user?._id) {
        //create notification
        await notifications_model_1.default.create({
            user: req.user?._id,
            title: "New Question Reply Received",
            message: `You have a new question in ${courseContent.title}`,
        });
    }
    else {
        const data = {
            name: question.user.name,
            title: courseContent.title,
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/question-reply.ejs"), data);
        try {
            await (0, sendMail_1.default)({
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
};
//add review in course
const addReviewInCourse = async (req) => {
    const { rating, review } = req.body;
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;
    //check exist course
    const courseExist = userCourseList?.some((course) => course._id.toString() === courseId.toString());
    if (!courseExist) {
        throw new ApiError_1.default(400, "You are not eligible to access this course");
    }
    const course = await courses_model_1.Course.findById(courseId);
    const reviewData = {
        user: req.user,
        rating,
        comment: review,
    };
    const reviews = (course?.reviews || []);
    reviews.push(reviewData);
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    if (course) {
        course.ratings = avg / reviews.length;
    }
    await course?.save();
    await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
    const notification = {
        title: "New review received",
        message: `${req.user?.name} has given a review in ${course?.name}`,
    };
    return course;
};
const addReplyToReview = async (req) => {
    const { comment, courseId, reviewId } = req.body;
    const course = await courses_model_1.Course.findById(courseId);
    const reviews = (course?.reviews || []);
    if (!course) {
        throw new ApiError_1.default(404, "Course not found");
    }
    const review = reviews?.find((rev) => rev._id.toString() === reviewId);
    if (!review) {
        throw new ApiError_1.default(404, "Review not found");
    }
    const replyData = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    if (!review.commentReplies) {
        review.commentReplies = [];
    }
    review.commentReplies?.push(replyData);
    await course?.save();
    return course;
};
//Get all Courses
const getAllCourses = async () => {
    const courses = await courses_model_1.Course.find().sort({ createdAt: -1 });
    return courses;
};
//delete course  only for admin
const deleteCourse = async (req) => {
    const { id } = req.params;
    const result = await courses_model_1.Course.findById(id);
    if (!result) {
        throw new ApiError_1.default(404, "Course not found");
    }
    await result.deleteOne({ id });
    await redis_1.redis.del(id);
};
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
