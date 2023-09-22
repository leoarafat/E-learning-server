"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const layouts_service_1 = require("./layouts.service");
//create Layout only for admin
const createLayout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield layouts_service_1.LayoutService.createLayout(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Layout create successful",
    });
}));
//create Layout only for admin
const updateLayout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield layouts_service_1.LayoutService.updateLayout(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Layout updated successful",
    });
}));
//create Layout only for admin
const getLayoutByType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield layouts_service_1.LayoutService.getLayoutByType(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Layout retrieved successful",
        data: result,
    });
}));
exports.LayoutController = {
    createLayout,
    updateLayout,
    getLayoutByType,
};
