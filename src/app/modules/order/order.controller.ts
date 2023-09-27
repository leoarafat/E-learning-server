import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";
import config from "../../../config";
const stripe = require("stripe")(config.stripe_secret_key);
const createOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.createOrder(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Order created successful`,
      data: result,
    });
  }
);
//Get all Orders
const getAllOrders: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getAllOrders();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Orders retrieved successful",
      data: result,
    });
  }
);

const sendStripePublishableKey: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishableKey: config.stripe_publishable_key,
    });
  }
);

// new payment
const newPayment = catchAsync(async (req: Request, res: Response) => {
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

export const OrderController = {
  createOrder,
  getAllOrders,
  sendStripePublishableKey,
  newPayment,
};
