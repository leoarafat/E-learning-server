import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";

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
export const OrderController = {
  createOrder,
  getAllOrders,
};
