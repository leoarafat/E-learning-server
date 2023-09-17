import { Request } from "express";
import Notification from "./notifications.model";
import ApiError from "../../../errors/ApiError";
import cron from "node-cron";

//Get
const getNotifications = async (req: Request) => {
  const result = await Notification.find().sort({ createdAt: -1 });
  return result;
};
//Update
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

//Delete
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await Notification.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("Deleted read notification");
});

export const NotificationService = { getNotifications, updateNotification };
