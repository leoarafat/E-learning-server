import { Request } from "express";
import { redis } from "../../../utils/redis";
import { Course } from "./courses.model";
import ApiError from "../../../errors/ApiError";

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

export const CourseService = { getSingleCourse, getAllCourse, getCourseByUser };
