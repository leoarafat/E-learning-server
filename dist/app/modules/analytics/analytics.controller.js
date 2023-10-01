"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const analytics_service_1 = require("./analytics.service");
//get users analytics only for admin
const getUsersAnalytics = (0, catchAsync_1.default)(async (req, res) => {
    const result = await analytics_service_1.AnalyticsService.getUsersAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved user analytics",
        data: result,
    });
});
//get courses analytics only for admin
const getCourseAnalytics = (0, catchAsync_1.default)(async (req, res) => {
    const result = await analytics_service_1.AnalyticsService.getCourseAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved courses analytics",
        data: result,
    });
});
//get orders analytics only for admin
const getOrdersAnalytics = (0, catchAsync_1.default)(async (req, res) => {
    const result = await analytics_service_1.AnalyticsService.getOrdersAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved orders analytics",
        data: result,
    });
});
exports.AnalyticsController = {
    getUsersAnalytics,
    getCourseAnalytics,
    getOrdersAnalytics,
};
