"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizedRoles = exports.isAuthenticated = void 0;
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../../utils/redis");
const isAuthenticated = () => async (req, res, next) => {
    try {
        //get authorization token
        const access_token = req.cookies.access_token;
        if (!access_token) {
            throw next(new ApiError_1.default(401, "Please login to access this resource"));
        }
        const decoded = jsonwebtoken_1.default.verify(access_token, config_1.default.jwt.access_token);
        if (!decoded) {
            throw next(new ApiError_1.default(400, "Access token is not valid"));
            // return next(new Error("Access token is not valid"));
        }
        const user = await redis_1.redis.get(decoded?.id);
        if (!user) {
            throw next(new ApiError_1.default(404, "Please login to access this resource"));
            // return next(new Error("User not found"));
        }
        req.user = JSON.parse(user);
        // Guard for role
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthenticated = isAuthenticated;
const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            throw next(new ApiError_1.default(403, `Role: ${req.user?.role} is not allowed to access this resource`));
        }
        next();
    };
};
exports.authorizedRoles = authorizedRoles;
