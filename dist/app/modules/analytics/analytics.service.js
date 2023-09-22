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
exports.AnalyticsService = void 0;
const analytics_generator_1 = require("../../../utils/analytics.generator");
const user_model_1 = __importDefault(require("../user/user.model"));
const courses_model_1 = require("../courses/courses.model");
const order_model_1 = __importDefault(require("../order/order.model"));
const getUsersAnalytics = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, analytics_generator_1.generatedLast12MonthData)(user_model_1.default);
    return users;
});
const getCourseAnalytics = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield (0, analytics_generator_1.generatedLast12MonthData)(courses_model_1.Course);
    return courses;
});
const getOrdersAnalytics = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield (0, analytics_generator_1.generatedLast12MonthData)(order_model_1.default);
    return orders;
});
exports.AnalyticsService = {
    getUsersAnalytics,
    getCourseAnalytics,
    getOrdersAnalytics,
};
