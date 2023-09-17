import { Document } from "mongoose";

export interface IFaqItem extends Document {
  question: string;
  answer: string;
}
export interface ICategory extends Document {
  title: string;
}
export interface IBannerImage extends Document {
  public_id: string;
  url: string;
}
export interface ILayout extends Document {
  type: string;
  faq: IFaqItem[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subTitle: string;
  };
}
