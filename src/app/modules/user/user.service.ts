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
  IProfilePicture,
  IRegistration,
  ISocialAuth,
  IUpdateUserInfo,
  IUpdateUserPassword,
  IUser,
  IUserLogin,
} from "./user.interface";
import User from "./user.model";
import ejs from "ejs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import { redis } from "../../../utils/redis";
import cloudinary from "cloudinary";
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
  } catch (error: any) {
    throw new ApiError(500, `${error.message}`);
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
    throw new ApiError(400, "Please login to access this resource");
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
  req.user = user;
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  await redis.set(user._id, JSON.stringify(user), "EX", 604800);
  res.status(200).json({
    status: "success",
    accessToken,
  });
};

//Get user by id
const getUserById = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const result = await redis.get(userId);
  if (result) {
    const user = JSON.parse(result);
    return user;
  }
};

const socialAuth = async (req: Request, res: Response) => {
  const { name, email, avatar } = req.body as ISocialAuth;
  const user = await User.findOne({ email });
  if (!user) {
    const newUser = await User.create({
      email,
      name,
      avatar,
    });
    sendToken(newUser, 200, res);
  } else {
    sendToken(user, 200, res);
  }
};

const updateUserInfo = async (req: Request, res: Response) => {
  const { name, email } = req.body as IUpdateUserInfo;
  const userId = req.user?._id;
  const user = await User.findById(userId);
  if (email && user) {
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      throw new ApiError(404, "Email already exist");
    }
    user.email = email;
  }
  if (name && user) {
    user.name = name;
  }
  await user?.save();
  await redis.set(userId, JSON.stringify(user));
  res.status(200).json({
    success: true,
    user,
  });
};
const updateUserPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body as IUpdateUserPassword;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please enter your old and new password");
  }
  const userId = req.user?._id;
  const user = await User.findById(userId).select("+password");

  if (!user || user.password === undefined) {
    throw new ApiError(400, "Invalid user");
  }
  const isPasswordMatch = await user?.comparePassword(oldPassword || "");
  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save();
  await redis.set(userId, JSON.stringify(user));
  res.status(201).json({
    success: true,
    user,
  });
};
const updateProfilePicture = async (req: Request, res: Response) => {
  const { avatar } = req.body as IProfilePicture;

  const userId = req?.user?._id;
  const user = await User.findById(userId);

  if (avatar && user) {
    if (user?.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });
      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.url,
      };
    } else {
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });
      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.url,
      };
    }
  }
  await user?.save();
  await redis.set(userId, JSON.stringify(user));
  res.status(200).json({
    success: true,
    user,
  });
};

//Get all user
const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users;
};
//Update user role only for admin
const updateUserRole = async (req: Request) => {
  const { id, role } = req.body;
  const result = await User.findByIdAndUpdate(id, { role }, { new: true });
  return result;
};
//delete user role only for admin
const deleteUser = async (req: Request) => {
  const { id } = req.params;
  const result = await User.findById(id);
  if (!result) {
    throw new ApiError(404, "User not found");
  }
  await result.deleteOne({ id });
  await redis.del(id);
};

export const UserService = {
  registrationUser,
  createActivationToken,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserById,
  socialAuth,
  updateUserInfo,
  updateUserPassword,
  updateProfilePicture,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
