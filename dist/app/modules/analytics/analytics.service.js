"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const analytics_generator_1 = require("../../../utils/analytics.generator");
const user_model_1 = __importDefault(require("../user/user.model"));
const courses_model_1 = require("../courses/courses.model");
const order_model_1 = __importDefault(require("../order/order.model"));
const getUsersAnalytics = async (req) => {
    const users = await (0, analytics_generator_1.generatedLast12MonthData)(user_model_1.default);
    return users;
};
const getCourseAnalytics = async (req) => {
    const courses = await (0, analytics_generator_1.generatedLast12MonthData)(courses_model_1.Course);
    return courses;
};
const getOrdersAnalytics = async (req) => {
    const orders = await (0, analytics_generator_1.generatedLast12MonthData)(order_model_1.default);
    return orders;
};
exports.AnalyticsService = {
    getUsersAnalytics,
    getCourseAnalytics,
    getOrdersAnalytics,
};
