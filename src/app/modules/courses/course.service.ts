import { Request } from "express";
import { redis } from "../../../utils/redis";
import { Course } from "./courses.model";
import ApiError from "../../../errors/ApiError";
import {
  IAddAnswerData,
  IAddQuestionData,
  IAddReviewData,
  IAddReviewReplyData,
  IReview,
} from "./courses.interface";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendEmail from "../../../utils/sendMail";
import Notification from "../notifications/notifications.model";

const getSingleCourse = async (id: string) => {
  const isExistCourse = await redis.get(id);

  if (isExistCourse) {
    const course = JSON.parse(isExistCourse);

    return course;
  } else {
    const result = await Course.findById(id).select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );

    await redis.set(id, JSON.stringify(result), "EX", 604800);
    return result;
  }
};
const getAllCourse = async () => {
  const result = await Course.find().select(
    "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
  );

  return result;
};

const getCourseByUser = async (req: Request) => {
  const { id } = req.params;

  const userCourseList = req.user?.courses;

  const courseExists = userCourseList?.find(
    (course: any) => course._id === String(id)
  );

  if (!courseExists) {
    throw new ApiError(404, "You are not eligible to access this course");
  }
  const course = await Course.findById(id);
  const content = course?.courseData;
  return content;
};

//add question
const addQuestion = async (req: Request) => {
  const { question, contentId, courseId }: IAddQuestionData = req.body;
  const course = await Course.findById(courseId);
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new ApiError(400, "Invalid content id");
  }
  const courseContent = course?.courseData?.find((item: any) =>
    item._id.equals(contentId)
  );
  if (!courseContent) {
    throw new ApiError(400, "Invalid content id");
  }
  const newQuestion: any = {
    user: req?.user,
    question,
    questionReply: [],
  };

  courseContent.questions.push(newQuestion);
  await Notification.create({
    user: req.user?._id,
    title: "New Question Received",
    message: `You have a new question in ${courseContent.title}`,
  });
  await course?.save();
  return course;
};
// add answer to question course
const addQuestionAnswer = async (req: Request) => {
  const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
  const course = await Course.findById(courseId);
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new ApiError(400, "Invalid content id");
  }
  const courseContent = course?.courseData?.find((item: any) =>
    item._id.equals(contentId)
  );
  if (!courseContent) {
    throw new ApiError(400, "Invalid content id");
  }
  const question = courseContent?.questions?.find((item: any) =>
    item._id.equals(questionId)
  );
  if (!question) {
    throw new ApiError(400, "Invalid question id");
  }
  const newAnswer: any = {
    user: req?.user,
    answer,
  };
  question.questionReplies.push(newAnswer);
  await course?.save();
  if (req.user?._id === question.user?._id) {
    //create notification
    await Notification.create({
      user: req.user?._id,
      title: "New Question Reply Received",
      message: `You have a new question in ${courseContent.title}`,
    });
  } else {
    const data = {
      name: question.user.name,
      title: courseContent.title,
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../../../mails/question-reply.ejs"),
      data
    );
    try {
      await sendEmail({
        email: question.user.email,
        subject: "Question Reply",
        template: "question-reply.ejs",
        data,
      });
    } catch (error: any) {
      throw new ApiError(500, `${error.message}`);
    }
  }
  return course;
};
//add review in course
const addReviewInCourse = async (req: Request) => {
  const { rating, review }: IAddReviewData = req.body;
  const userCourseList = req.user?.courses;
  const courseId = req.params.id;
  //check exist course
  const courseExist = userCourseList?.some(
    (course: any) => course._id.toString() === courseId.toString()
  );
  if (!courseExist) {
    throw new ApiError(400, "You are not eligible to access this course");
  }
  const course = await Course.findById(courseId);
  const reviewData: any = {
    user: req.user,
    rating,
    comment: review,
  };
  const reviews: IReview[] = (course?.reviews || []) as IReview[];
  reviews.push(reviewData);
  let avg = 0;
  reviews.forEach((rev: any) => {
    avg += rev.rating;
  });
  if (course) {
    course.ratings = avg / reviews.length;
  }
  await course?.save();
  const notification = {
    title: "New review received",
    message: `${req.user?.name} has given a review in ${course?.name}`,
  };
  return course;
};
const addReplyToReview = async (req: Request) => {
  const { comment, courseId, reviewId } = req.body as IAddReviewReplyData;
  const course = await Course.findById(courseId);
  const reviews: IReview[] = (course?.reviews || []) as IReview[];
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const review = reviews?.find(
    (rev: IReview) => rev._id.toString() === reviewId
  );
  if (!review) {
    throw new ApiError(404, "Review not found");
  }
  const replyData: any = {
    user: req.user,
    comment,
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
  const courses = await Course.find().sort({ createdAt: -1 });
  return courses;
};
//delete course  only for admin
const deleteCourse = async (req: Request) => {
  const { id } = req.params;
  const result = await Course.findById(id);
  if (!result) {
    throw new ApiError(404, "Course not found");
  }
  await result.deleteOne({ id });
  await redis.del(id);
};
export const CourseService = {
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
