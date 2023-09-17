import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LayoutService } from "./layouts.service";

//create Layout only for admin
const createLayout: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await LayoutService.createLayout(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Layout create successful",
    });
  }
);
//create Layout only for admin
const updateLayout: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await LayoutService.updateLayout(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Layout updated successful",
    });
  }
);
//create Layout only for admin
const getLayoutByType: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LayoutService.getLayoutByType(req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Layout retrieved successful",
      data: result,
    });
  }
);
export const LayoutController = {
  createLayout,
  updateLayout,
  getLayoutByType,
};
