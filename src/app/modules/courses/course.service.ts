import { Request } from "express";
import { redis } from "../../../utils/redis";
import { Course } from "./courses.model";
import ApiError from "../../../errors/ApiError";
import { IAddAnswerData, IAddQuestionData } from "./courses.interface";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendEmail from "../../../utils/sendMail";
const getSingleCourse = async (id: string) => {
  const isExistCourse = await redis.get(id);

  if (isExistCourse) {
    const course = JSON.parse(isExistCourse);

    return course;
  } else {
    const result = await Course.findById(id).select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );

    await redis.set(id, JSON.stringify(result));
    return result;
  }
};
const getAllCourse = async () => {
  const isChaseExist = await redis.get("allCourses");
  if (isChaseExist) {
    const courses = JSON.parse(isChaseExist);
    console.log("hitting redis");
    return courses;
  } else {
    const result = await Course.find().select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );
    console.log("hitting mongoose");
    await redis.set("allCourses", JSON.stringify(result));
    return result;
  }
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
export const CourseService = {
  getSingleCourse,
  getAllCourse,
  getCourseByUser,
  addQuestion,
  addQuestionAnswer,
};
