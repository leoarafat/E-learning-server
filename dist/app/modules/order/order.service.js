"use strict";
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
const redis_1 = require("../../../utils/redis");
const config_1 = __importDefault(require("../../../config"));
const stripe = require("stripe")(config_1.default.stripe_secret_key);
//create order with send email notification
const createOrder = async (req) => {
    const { courseId, payment_info } = req.body;
    if (payment_info) {
        if ("id" in payment_info) {
            const paymentIntentId = payment_info.id;
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                throw new ApiError_1.default(400, "Payment not authorized!");
            }
        }
    }
    const user = await user_model_1.default.findById(req.user?._id);
    const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
    if (courseExistInUser) {
        throw new ApiError_1.default(400, "You have already purchased this course");
    }
    const course = await courses_model_1.Course.findById(courseId);
    if (!course) {
        throw new ApiError_1.default(404, "Course not found");
    }
    const data = {
        courseId: course._id,
        userId: user?._id,
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
    const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/order-confirmation.ejs"), { order: mailData });
    try {
        if (user) {
            await (0, sendMail_1.default)({
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
    user?.courses.push(course?._id);
    await redis_1.redis.set(req.user?._id, JSON.stringify(user));
    await user?.save();
    await notifications_model_1.default.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
    });
    //   course.purchased ? (course.purchased += 1) : course.purchased;
    //   course.purchased += 1;
    if (course) {
        course.purchased = (course.purchased || 0) + 1;
        await course.save();
    }
    else {
    }
    await order_model_1.default.create(data);
    return { order: course };
};
//Get all Orders
const getAllOrders = async () => {
    const orders = await order_model_1.default.find().sort({ createdAt: -1 });
    return orders;
};
exports.OrderService = {
    createOrder,
    getAllOrders,
};
