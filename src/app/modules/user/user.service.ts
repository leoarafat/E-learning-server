import { Request, Response } from "express";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../../../utils/jwt";
import sendEmail from "../../../utils/sendMail";
import {
  IActivationRequest,
  IActivationToken,
  IRegistration,
  IUser,
  IUserLogin,
} from "./user.interface";
import User from "./user.model";
import ejs from "ejs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import { redis } from "../../../utils/redis";
const registrationUser = async (payload: IRegistration) => {
  const { name, email, password } = payload;
  const user = {
    name,
    email,
    password,
  };

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    throw new ApiError(400, "Email already exist");
  }

  const activationToken = createActivationToken(user);
  const activationCode = activationToken.activationCode;
  const data = { user: { name: user.name }, activationCode };
  const html = await ejs.renderFile(
    path.join(__dirname, "../../../mails/activation-mail.ejs"),
    data
  );
  try {
    await sendEmail({
      email: user.email,
      subject: "Activate Your Account",
      template: "activation-mail.ejs",
      data,
    });
  } catch (error) {
    console.log(error);
  }
  return {
    activationToken: activationToken.token,
    user,
  };
};

const createActivationToken = (user: IRegistration): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    config.activation_secret as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

const activateUser = async (payload: IActivationRequest) => {
  const { activation_code, activation_token } = payload;
  const newUser: { user: IUser; activationCode: string } = jwt.verify(
    activation_token,
    config.activation_secret as string
  ) as { user: IUser; activationCode: string };
  if (newUser.activationCode !== activation_code) {
    throw new ApiError(400, "Activation code is not valid");
  }
  const { name, email, password } = newUser.user;
  const existUser = await User.findOne({ email });
  if (existUser) {
    throw new ApiError(400, "Email is already exist");
  }
  const user = await User.create({
    name,
    email,
    password,
  });
  return user;
};

//Login User
const loginUser = async (payload: IUserLogin, res: Response) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new ApiError(400, "Please enter your email and password");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid email or password");
  }
  sendToken(user, 200, res);
};

//Logout user
const logoutUser = async (req: Request, res: Response) => {
  res.cookie("access_token", "", { maxAge: 1 });
  res.cookie("refresh_token", "", { maxAge: 1 });
  const userId = req.user?._id || null;
  redis.del(userId);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const updateAccessToken = async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token as string;
  const decoded = jwt.verify(
    refresh_token,
    config.jwt.refresh_token as string
  ) as JwtPayload;
  const message = "Could not refresh token";

  if (!decoded) {
    throw new ApiError(400, message);
  }
  const session = await redis.get(decoded.id as string);
  if (!session) {
    throw new ApiError(400, message);
  }
  const user = JSON.parse(session);
  const accessToken = jwt.sign(
    { id: user._id },
    config.jwt.access_token as string,
    {
      expiresIn: "5m",
    }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    config.jwt.refresh_token as string,
    {
      expiresIn: "3d",
    }
  );
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.status(200).json({
    status: "success",
    accessToken,
  });
};

//Get user
const getUserById = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const result = await User.findById(userId);
  return result;
};

export const UserService = {
  registrationUser,
  createActivationToken,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserById,
};
