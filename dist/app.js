"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const NotFoundHandler_1 = require("./errors/NotFoundHandler ");
const express_rate_limit_1 = require("express-rate-limit");
exports.app = (0, express_1.default)();
//cors
exports.app.use((0, cors_1.default)({
    // origin: ["http://localhost:3000"],
    origin: ["https://study-sync-eta.vercel.app"],
    credentials: true,
}));
//cookie
exports.app.use((0, cookie_parser_1.default)());
//parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
//Rate limit
const limiter = (0, express_rate_limit_1.rateLimit)({
    max: 100,
    windowMs: 15 * 60 * 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "too many requests sent by this ip, please try again in 15 minute !",
});
//All Routes
exports.app.use("/api/v1", routes_1.default);
exports.app.use(limiter);
// Global Error Handler
exports.app.use(globalErrorHandler_1.default);
// handle not found
exports.app.use(NotFoundHandler_1.NotFoundHandler.handle);
