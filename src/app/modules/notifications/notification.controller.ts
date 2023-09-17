import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { NotificationService } from "./notification.service";

//get notification only for admin
const getNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.getNotifications(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification retrieved successfully`,
      data: result,
    });
  }
);
//update notification only for admin
const updateNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.updateNotification(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification updated successfully`,
      data: result,
    });
  }
);

export const NotificationController = { getNotifications, updateNotification };
