import { Response } from "express";
import { ITokenOptions, IUser } from "../app/modules/user/user.interface";
import config from "../config";
import { redis } from "./redis";
import { json } from "stream/consumers";

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session to redis
  redis.set(user._id, JSON.stringify(user) as any);
  //parse env
  const accessTokenExpire = parseInt(
    config.jwt.access_token_expires || "300",
    10
  );
  const refreshTokenExpire = parseInt(
    config.jwt.refresh_token_expires || "1200",
    10
  );

  //options for cookies
  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  if (config.env === "production") {
    accessTokenOptions.secure = true;
  }
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
