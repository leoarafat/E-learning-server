"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutService = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const layouts_model_1 = __importDefault(require("./layouts.model"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const createLayout = async (req) => {
    const { type } = req.body;
    const isExist = await layouts_model_1.default.findOne({ type });
    if (isExist) {
        throw new ApiError_1.default(400, `${type} is already exist`);
    }
    if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
            folder: "layout",
        });
        const banner = {
            type: "Banner",
            banner: {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            },
        };
        await layouts_model_1.default.create(banner);
    }
    if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = await Promise.all(faq.map(async (item) => {
            return {
                question: item.question,
                answer: item.answer,
            };
        }));
        await layouts_model_1.default.create({ type: "FAQ", faq: faqItems });
    }
    if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItem = await Promise.all(categories.map(async (item) => {
            return {
                title: item.title,
            };
        }));
        await layouts_model_1.default.create({ type: "Categories", categories: categoriesItem });
    }
};
const updateLayout = async (req) => {
    const { type } = req.body;
    if (type === "Banner") {
        const bannerData = await layouts_model_1.default.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;
        const data = image.startsWith("https")
            ? bannerData
            : await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
        // const myCloud = await cloudinary.v2.uploader.upload(image, {
        //   folder: "layout",
        // });
        const banner = {
            type: "Banner",
            image: {
                public_id: image.startsWith("https")
                    ? bannerData.banner.image.public_id
                    : data?.public_id,
                url: image.startsWith("https")
                    ? bannerData.banner.image.url
                    : data?.secure_url,
            },
            title,
            subTitle,
        };
        await layouts_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
    }
    if (type === "FAQ") {
        const { faq } = req.body;
        const faqItem = await layouts_model_1.default.findOne({ type: "FAQ" });
        const faqItems = await Promise.all(faq.map(async (item) => {
            return {
                question: item.question,
                answer: item.answer,
            };
        }));
        await layouts_model_1.default.findByIdAndUpdate(faqItem?._id, {
            type: "FAQ",
            faq: faqItems,
        });
    }
    if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItem = await layouts_model_1.default.findOne({ type: "Categories" });
        const categoriesItems = await Promise.all(categories.map(async (item) => {
            return {
                title: item.title,
            };
        }));
        await layouts_model_1.default.findByIdAndUpdate(categoriesItem?._id, {
            type: "Categories",
            categories: categoriesItems,
        });
    }
};
const getLayoutByType = async (req) => {
    const { type } = req.params;
    const layout = await layouts_model_1.default.findOne({ type });
    return layout;
};
exports.LayoutService = {
    createLayout,
    updateLayout,
    getLayoutByType,
};
