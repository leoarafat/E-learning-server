"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const order_service_1 = require("./order.service");
const config_1 = __importDefault(require("../../../config"));
const stripe = require("stripe")(config_1.default.stripe_secret_key);
const createOrder = (0, catchAsync_1.default)(async (req, res) => {
    const result = await order_service_1.OrderService.createOrder(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Order created successful`,
        data: result,
    });
});
//Get all Orders
const getAllOrders = (0, catchAsync_1.default)(async (req, res) => {
    const result = await order_service_1.OrderService.getAllOrders();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successful",
        data: result,
    });
});
const sendStripePublishableKey = (0, catchAsync_1.default)(async (req, res) => {
    res.status(200).json({
        publishableKey: config_1.default.stripe_publishable_key,
    });
});
// new payment
const newPayment = (0, catchAsync_1.default)(async (req, res) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
            company: "StudySync",
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });
    res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
    });
});
exports.OrderController = {
    createOrder,
    getAllOrders,
    sendStripePublishableKey,
    newPayment,
};
