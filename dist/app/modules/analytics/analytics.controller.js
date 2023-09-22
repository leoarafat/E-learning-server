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
exports.AnalyticsController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const analytics_service_1 = require("./analytics.service");
//get users analytics only for admin
const getUsersAnalytics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analytics_service_1.AnalyticsService.getUsersAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved user analytics",
        data: result,
    });
}));
//get courses analytics only for admin
const getCourseAnalytics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analytics_service_1.AnalyticsService.getCourseAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved courses analytics",
        data: result,
    });
}));
//get orders analytics only for admin
const getOrdersAnalytics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analytics_service_1.AnalyticsService.getOrdersAnalytics(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Retrieved orders analytics",
        data: result,
    });
}));
exports.AnalyticsController = {
    getUsersAnalytics,
    getCourseAnalytics,
    getOrdersAnalytics,
};
