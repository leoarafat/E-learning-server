import { Request } from "express";
import { generatedLast12MonthData } from "../../../utils/analytics.generator";
import User from "../user/user.model";
import { Course } from "../courses/courses.model";
import Order from "../order/order.model";

const getUsersAnalytics = async (req: Request) => {
  const users = await generatedLast12MonthData(User);
  return users;
};
const getCourseAnalytics = async (req: Request) => {
  const courses = await generatedLast12MonthData(Course);
  return courses;
};
const getOrdersAnalytics = async (req: Request) => {
  const orders = await generatedLast12MonthData(Order);
  return orders;
};

export const AnalyticsService = {
  getUsersAnalytics,
  getCourseAnalytics,
  getOrdersAnalytics,
};
