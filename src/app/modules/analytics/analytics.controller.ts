import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";

//get users analytics only for admin
const getUsersAnalytics: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getUsersAnalytics(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Retrieved user analytics",
      data: result,
    });
  }
);
//get courses analytics only for admin
const getCourseAnalytics: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getCourseAnalytics(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Retrieved courses analytics",
      data: result,
    });
  }
);
//get orders analytics only for admin
const getOrdersAnalytics: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getOrdersAnalytics(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Retrieved orders analytics",
      data: result,
    });
  }
);

export const AnalyticsController = {
  getUsersAnalytics,
  getCourseAnalytics,
  getOrdersAnalytics,
};
