"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notifications_model_1 = __importDefault(require("./notifications.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const node_cron_1 = __importDefault(require("node-cron"));
//Get
const getNotifications = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notifications_model_1.default.find().sort({ createdAt: -1 });
    return result;
});
//Update
const updateNotification = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notifications_model_1.default.findById(req.params.id);
    if (!notification) {
        throw new ApiError_1.default(404, "Notification not found");
    }
    else {
        notification.status ? (notification.status = "read") : notification === null || notification === void 0 ? void 0 : notification.status;
    }
    yield notification.save();
    const notifications = yield notifications_model_1.default.find().sort({
        createdAt: -1,
    });
    return notifications;
});
//Delete
node_cron_1.default.schedule("0 0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    yield notifications_model_1.default.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo },
    });
    console.log("Deleted read notification");
}));
exports.NotificationService = { getNotifications, updateNotification };
