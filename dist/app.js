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
const config_1 = __importDefault(require("./config"));
exports.app = (0, express_1.default)();
//cors
exports.app.use((0, cors_1.default)({
    origin: config_1.default.origin_url,
}));
//cookie
exports.app.use((0, cookie_parser_1.default)());
//parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
//All Routes
exports.app.use("/api/v1", routes_1.default);
// Global Error Handler
exports.app.use(globalErrorHandler_1.default);
// handle not found
exports.app.use(NotFoundHandler_1.NotFoundHandler.handle);
