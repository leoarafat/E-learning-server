"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const notification_service_1 = require("./notification.service");
//get notification only for admin
const getNotifications = (0, catchAsync_1.default)(async (req, res) => {
    const result = await notification_service_1.NotificationService.getNotifications(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Notification retrieved successfully`,
        data: result,
    });
});
//update notification only for admin
const updateNotification = (0, catchAsync_1.default)(async (req, res) => {
    const result = await notification_service_1.NotificationService.updateNotification(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Notification updated successfully`,
        data: result,
    });
});
exports.NotificationController = { getNotifications, updateNotification };
