import { Request, RequestHandler, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";

const registrationUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.registrationUser(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Please check your email: ${result?.user?.email} to active your account`,
      activationToken: result.activationToken,
    });
  }
);
const activateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await UserService.activateUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User activate successful",
    });
  }
);
const loginUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    await UserService.loginUser(req.body, res);

    // sendResponse(res, {
    //   statusCode: 200,
    //   success: true,
    //   message: "User loggedin successful",
    // });
  }
);
export const UserController = {
  registrationUser,
  activateUser,
  loginUser,
};
