import { Schema, model } from "mongoose";
import {
  IBannerImage,
  ICategory,
  IFaqItem,
  ILayout,
} from "./layouts.interface";

const faqSchema = new Schema<IFaqItem>({
  question: { type: String },
  answer: { type: String },
});
const categorySchema = new Schema<ICategory>({
  title: { type: String },
});
const bannerImageSchema = new Schema<IBannerImage>({
  public_id: { type: String },
  url: { type: String },
});
const layoutSchema = new Schema<ILayout>({
  type: { type: String },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: { type: String },
    subTitle: {
      type: String,
    },
  },
});

const Layout = model<ILayout>("Layout", layoutSchema);
export default Layout;
