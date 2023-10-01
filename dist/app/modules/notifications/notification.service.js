"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notifications_model_1 = __importDefault(require("./notifications.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const node_cron_1 = __importDefault(require("node-cron"));
//Get
const getNotifications = async (req) => {
    const result = await notifications_model_1.default.find().sort({ createdAt: -1 });
    return result;
};
//Update
const updateNotification = async (req) => {
    const notification = await notifications_model_1.default.findById(req.params.id);
    if (!notification) {
        throw new ApiError_1.default(404, "Notification not found");
    }
    else {
        notification.status ? (notification.status = "read") : notification?.status;
    }
    await notification.save();
    const notifications = await notifications_model_1.default.find().sort({
        createdAt: -1,
    });
    return notifications;
};
//Delete
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notifications_model_1.default.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo },
    });
    console.log("Deleted read notification");
});
exports.NotificationService = { getNotifications, updateNotification };
