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
exports.LayoutService = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const layouts_model_1 = __importDefault(require("./layouts.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const createLayout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    const isExist = yield layouts_model_1.default.findOne({ type });
    if (isExist) {
        throw new ApiError_1.default(400, `${type} is already exist`);
    }
    if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
            folder: "layout",
        });
        const banner = {
            image: {
                public_id: myCloud.public_id,
                url: myCloud.url,
            },
            title,
            subTitle,
        };
        yield layouts_model_1.default.create(banner);
    }
    if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = yield Promise.all(faq.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                question: item.question,
                answer: item.answer,
            };
        })));
        yield layouts_model_1.default.create({ type: "FAQ", faq: faqItems });
    }
    if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItem = yield Promise.all(categories.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                title: item.title,
            };
        })));
        yield layouts_model_1.default.create({ type: "Categories", categories: categoriesItem });
    }
});
const updateLayout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    if (type === "Banner") {
        const bannerData = yield layouts_model_1.default.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;
        if (bannerData) {
            yield cloudinary_1.default.v2.uploader.destroy(bannerData.image.public_id);
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
            folder: "layout",
        });
        const banner = {
            type: "Banner",
            image: {
                public_id: myCloud.public_id,
                url: myCloud.url,
            },
            title,
            subTitle,
        };
        yield layouts_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
    }
    if (type === "FAQ") {
        const { faq } = req.body;
        const faqItem = yield layouts_model_1.default.findOne({ type: "FAQ" });
        const faqItems = yield Promise.all(faq.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                question: item.question,
                answer: item.answer,
            };
        })));
        yield layouts_model_1.default.findByIdAndUpdate(faqItem === null || faqItem === void 0 ? void 0 : faqItem._id, {
            type: "FAQ",
            faq: faqItems,
        });
    }
    if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItem = yield layouts_model_1.default.findOne({ type: "Categories" });
        const categoriesItems = yield Promise.all(categories.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                title: item.title,
            };
        })));
        yield layouts_model_1.default.findByIdAndUpdate(categoriesItem === null || categoriesItem === void 0 ? void 0 : categoriesItem._id, {
            type: "Categories",
            categories: categoriesItems,
        });
    }
});
const getLayoutByType = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    const layout = yield layouts_model_1.default.findOne({ type });
    return layout;
});
exports.LayoutService = {
    createLayout,
    updateLayout,
    getLayoutByType,
};
