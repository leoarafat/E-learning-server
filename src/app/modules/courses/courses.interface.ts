import { Document } from "mongoose";
import { IUser } from "../user/user.interface";

export interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: IComment[];
}
export interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies?: IComment[];
}
export interface ILink extends Document {
  title: string;
  url: string;
}
export interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}
export interface ICourse extends Document {
  name: string;
  description?: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string[] };
  prerequisites: { title: string[] };
  reviews: IReview;
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
}

export interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}
export interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export interface IAddReviewData {
  review: string;
  courseId: string;
  rating: string;
  userId: string;
}
export interface IAddReviewReplyData {
  comment: string;
  courseId: string;
  reviewId: string;
}
