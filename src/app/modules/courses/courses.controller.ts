import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import cloudinary from "cloudinary";
import { Course } from "./courses.model";
import { CourseService } from "./course.service";

//Upload course
const uploadCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "Courses",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    const result = await Course.create(data);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course created successfully`,
      data: result,
    });
  }
);
//edit course
const editCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "Courses",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const courseId = req.params.id;
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: data,
      },
      {
        new: true,
      }
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course updated successfully`,
      data: course,
    });
  }
);

//get single course without purchase
const getSingleCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CourseService.getSingleCourse(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course retrieved successfully`,
      data: result,
    });
  }
);
//get all course without purchase
const getAllCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.getAllCourse();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course retrieved successfully`,
      data: result,
    });
  }
);
//get all course only for valid user
const getCourseByUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.getCourseByUser(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course retrieved successfully`,
      data: result,
    });
  }
);

//add question
const addQuestion: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.addQuestion(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Question added successfully`,
      data: result,
    });
  }
);
//add answer in course question
const addQuestionAnswer: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.addQuestionAnswer(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Question answer successfully`,
      data: result,
    });
  }
);
//add review in course
const addReviewInCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.addReviewInCourse(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Review added successfully`,
      data: result,
    });
  }
);

//add reply in review
const addReplyToReview: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.addReplyToReview(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Review reply added successfully`,
      data: result,
    });
  }
);
export const CourseController = {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourse,
  getCourseByUser,
  addQuestion,
  addQuestionAnswer,
  addReviewInCourse,
};
