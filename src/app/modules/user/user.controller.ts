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

export const UserController = {
  registrationUser,
};

// import { Request, RequestHandler, Response } from "express";
// import sendResponse from "../../../shared/sendResponse";
// import catchAsync from "../../../shared/catchAsync";
// import config from "../../../config";
// import ApiError from "../../../errors/ApiError";
// import sendEmail from "../../../utils/sendMail";
// import { IActivationToken, IRegistration, IUser } from "./user.interface";
// import User from "./user.model";
// import ejs from "ejs";
// import jwt, { Secret } from "jsonwebtoken";
// import path from "path";

// const registrationUser: RequestHandler = catchAsync(
//   async (req: Request, res: Response) => {
//     const { name, email, password } = req.body;
//     const user = {
//       name,
//       email,
//       password,
//     };

//     const isEmailExist = await User.findOne({ email });
//     if (isEmailExist) {
//       throw new ApiError(400, "Email already exist");
//     }

//     const activationToken = createActivationToken(user);
//     const activationCode = activationToken.activationCode;
//     const data = { user: { name: user.name }, activationCode };
//     const html = await ejs.renderFile(
//       path.join(__dirname, "../../../mails/activation-mail.ejs"),
//       data
//     );
//     try {
//       await sendEmail({
//         email: user.email,
//         subject: "Activate Your Account",
//         template: "activation-mail.ejs",
//         data,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: `Please check your email: ${user.email} to active your account`,
//       activationToken: activationToken.token,
//     });
//   }
// );
// export const createActivationToken = (
//   user: IRegistration
// ): IActivationToken => {
//   const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

//   const token = jwt.sign(
//     {
//       user,
//       activationCode,
//     },
//     config.activation_secret as Secret,
//     {
//       expiresIn: "5m",
//     }
//   );
//   return { token, activationCode };
// };
// export const UserController = {
//   registrationUser,
// };
