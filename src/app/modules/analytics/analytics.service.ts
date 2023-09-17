import { Request } from "express";
import { generatedLast12MonthData } from "../../../utils/analytics.generator";
import User from "../user/user.model";
import { Course } from "../courses/courses.model";

const getUsersAnalytics = async (req: Request) => {
  const users = await generatedLast12MonthData(User);
  return users;
};
const getCourseAnalytics = async (req: Request) => {
  const courses = await generatedLast12MonthData(Course);
  return courses;
};

export const AnalyticsService = { getUsersAnalytics, getCourseAnalytics };
