import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import cloudinary from "cloudinary";
import { Course } from "./courses.model";
import { CourseService } from "./course.service";
import axios from "axios";
import config from "../../../config";
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
    const courseId = req.params.id;

    const courseData = (await Course.findById(courseId)) as any;

    if (thumbnail && !thumbnail.startsWith("https")) {
      await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_url);

      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
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
//Get all courses
const getAllCourses: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CourseService.getAllCourses();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Course retrieved successful",
      data: result,
    });
  }
);
//Delete Course only for admin
const deleteCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await CourseService.deleteCourse(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Course deleted successful",
    });
  }
);
const generateVideoUrl: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { videoId } = req.body;

    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      {
        ttl: 300,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Apisecret ${config.video_cipher_api_key}`,
        },
      }
    );
    console.log(response.data);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: response.data,
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
  addReplyToReview,
  getAllCourses,
  deleteCourse,
  generateVideoUrl,
};
