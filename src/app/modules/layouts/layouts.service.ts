import { Request } from "express";
import cloudinary from "cloudinary";
import Layout from "./layouts.model";
import ApiError from "../../../errors/ApiError";

const createLayout = async (req: Request) => {
  const { type } = req.body;
  const isExist = await Layout.findOne({ type });
  if (isExist) {
    throw new ApiError(400, `${type} is already exist`);
  }
  if (type === "Banner") {
    const { image, title, subTitle } = req.body;
    const myCloud = await cloudinary.v2.uploader.upload(image, {
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
    await Layout.create(banner);
  }
  if (type === "FAQ") {
    const { faq } = req.body;
    const faqItems = await Promise.all(
      faq.map(async (item: any) => {
        return {
          question: item.question,
          answer: item.answer,
        };
      })
    );
    await Layout.create({ type: "FAQ", faq: faqItems });
  }
  if (type === "Categories") {
    const { categories } = req.body;
    const categoriesItem = await Promise.all(
      categories.map(async (item: any) => {
        return {
          title: item.title,
        };
      })
    );
    await Layout.create({ type: "Categories", categories: categoriesItem });
  }
};

const updateLayout = async (req: Request) => {
  const { type } = req.body;

  if (type === "Banner") {
    const bannerData: any = await Layout.findOne({ type: "Banner" });
    const { image, title, subTitle } = req.body;
    const data = image.startsWith("https")
      ? bannerData
      : await cloudinary.v2.uploader.upload(image, {
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

    await Layout.findByIdAndUpdate(bannerData._id, { banner });
  }
  if (type === "FAQ") {
    const { faq } = req.body;
    const faqItem = await Layout.findOne({ type: "FAQ" });

    const faqItems = await Promise.all(
      faq.map(async (item: any) => {
        return {
          question: item.question,
          answer: item.answer,
        };
      })
    );
    await Layout.findByIdAndUpdate(faqItem?._id, {
      type: "FAQ",
      faq: faqItems,
    });
  }
  if (type === "Categories") {
    const { categories } = req.body;
    const categoriesItem = await Layout.findOne({ type: "Categories" });
    const categoriesItems = await Promise.all(
      categories.map(async (item: any) => {
        return {
          title: item.title,
        };
      })
    );
    await Layout.findByIdAndUpdate(categoriesItem?._id, {
      type: "Categories",
      categories: categoriesItems,
    });
  }
};

const getLayoutByType = async (req: Request) => {
  const { type } = req.params;
  const layout = await Layout.findOne({ type });
  return layout;
};
export const LayoutService = {
  createLayout,
  updateLayout,
  getLayoutByType,
};
