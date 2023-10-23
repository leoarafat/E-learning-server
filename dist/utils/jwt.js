"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const config_1 = __importDefault(require("../config"));
const redis_1 = require("./redis");
//parse env
const accessTokenExpire = parseInt(config_1.default.jwt.access_token_expires || "300", 10);
const refreshTokenExpire = parseInt(config_1.default.jwt.refresh_token_expires || "1200", 10);
//options for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    //upload session to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    if (config_1.default.env === "production") {
        exports.accessTokenOptions.secure = true;
    }
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
