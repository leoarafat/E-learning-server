import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import cloudinary from "cloudinary";
import { Course } from "./courses.model";

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

//get single course
const getSingleCourse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Course created successfully`,
      data: {},
    });
  }
);
export const CourseController = {
  uploadCourse,
  editCourse,
  getSingleCourse,
};
