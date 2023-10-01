"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const handleValidationError_1 = __importDefault(require("../../errors/handleValidationError"));
const handleCastError_1 = require("../../errors/handleCastError");
const globalErrorHandler = (error, req, res, next) => {
    config_1.default.env === "development"
        ? console.log("globalErrorHandler", error)
        : console.log("globalErrorHandler", error);
    let statusCode = 500;
    let message = "Something went wrong !";
    let errorMessages = [];
    if (error?.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error?.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof ApiError_1.default) {
        statusCode = error?.statusCode;
        message = error.message;
        errorMessages = error?.message
            ? [
                {
                    path: "",
                    message: error?.message,
                },
            ]
            : [];
    }
    else if (error instanceof mongoose_1.Error) {
        message = error?.message;
        errorMessages = error?.message
            ? [
                {
                    path: "",
                    message: error?.message,
                },
            ]
            : [];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config_1.default.env !== "production" ? error?.stack : undefined,
    });
};
exports.default = globalErrorHandler;
