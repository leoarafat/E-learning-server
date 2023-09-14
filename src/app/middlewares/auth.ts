import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import jwt from "jsonwebtoken";
import { redis } from "../../utils/redis";

export const isAuthenticated =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token

      const access_token = req.cookies.access_token as string;
      if (!access_token) {
        throw next(new ApiError(401, "Please login to access this resource"));
      }
      const decoded = jwt.verify(
        access_token,
        config.jwt.access_token as string
      ) as JwtPayload;
      if (!decoded) {
        throw next(new ApiError(400, "Access token is not valid"));
        // return next(new Error("Access token is not valid"));
      }
      const user = await redis.get(decoded?.id);
      if (!user) {
        throw next(new ApiError(404, "User not found"));
        // return next(new Error("User not found"));
      }
      req.user = JSON.parse(user);

      // Guard for role

      next();
    } catch (error) {
      next(error);
    }
  };

export const authorizedRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      throw next(
        new ApiError(
          403,
          `Role: ${req.user?.role} is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
