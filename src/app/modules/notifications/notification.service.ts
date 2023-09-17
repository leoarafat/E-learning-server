import { Request } from "express";
import Notification from "./notifications.model";
import ApiError from "../../../errors/ApiError";

const getNotifications = async (req: Request) => {
  const result = await Notification.find().sort({ createdAt: -1 });
  return result;
};
const updateNotification = async (req: Request) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  } else {
    notification.status ? (notification.status = "read") : notification?.status;
  }
  await notification.save();
  const notifications = await Notification.find().sort({
    createdAt: -1,
  });
  return notifications;
};

export const NotificationService = { getNotifications, updateNotification };
