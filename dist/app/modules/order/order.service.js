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
exports.OrderService = void 0;
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const user_model_1 = __importDefault(require("../user/user.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const courses_model_1 = require("../courses/courses.model");
const order_model_1 = __importDefault(require("./order.model"));
const sendMail_1 = __importDefault(require("../../../utils/sendMail"));
const notifications_model_1 = __importDefault(require("../notifications/notifications.model"));
//create order with send email notification
const createOrder = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { courseId, payment_info } = req.body;
    const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    const courseExistInUser = user === null || user === void 0 ? void 0 : user.courses.some((course) => course._id.toString() === courseId);
    if (courseExistInUser) {
        throw new ApiError_1.default(400, "You have already purchased this course");
    }
    const course = yield courses_model_1.Course.findById(courseId);
    if (!course) {
        throw new ApiError_1.default(404, "Course not found");
    }
    const data = {
        courseId: course._id,
        userId: user === null || user === void 0 ? void 0 : user._id,
    };
    const mailData = {
        order: {
            _id: course._id.toString().slice(0, 6),
            name: course.name,
            price: course.price,
            date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        },
    };
    const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/order-confirmation.ejs"), { order: mailData });
    try {
        if (user) {
            yield (0, sendMail_1.default)({
                email: user.email,
                subject: "Order Confirmation",
                template: "order-confirmation.ejs",
                data: mailData,
            });
        }
    }
    catch (error) {
        throw new ApiError_1.default(400, `${error.message}`);
    }
    user === null || user === void 0 ? void 0 : user.courses.push(course === null || course === void 0 ? void 0 : course._id);
    yield (user === null || user === void 0 ? void 0 : user.save());
    yield notifications_model_1.default.create({
        user: user === null || user === void 0 ? void 0 : user._id,
        title: "New Order",
        message: `You have a new order from ${course === null || course === void 0 ? void 0 : course.name}`,
    });
    //   course.purchased ? (course.purchased += 1) : course.purchased;
    //   course.purchased += 1;
    if (course) {
        course.purchased = (course.purchased || 0) + 1;
        yield course.save();
    }
    else {
    }
    yield order_model_1.default.create(data);
    return { order: course };
});
//Get all Orders
const getAllOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find().sort({ createdAt: -1 });
    return orders;
});
exports.OrderService = {
    createOrder,
    getAllOrders,
};
