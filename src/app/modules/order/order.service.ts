import { Request } from "express";
import path from "path";
import ejs from "ejs";
import { IOrder } from "./order.interface";
import User from "../user/user.model";
import ApiError from "../../../errors/ApiError";
import { Course } from "../courses/courses.model";
import Order from "./order.model";
import sendEmail from "../../../utils/sendMail";
import Notification from "../notifications/notifications.model";
import { redis } from "../../../utils/redis";
import config from "../../../config";
const stripe = require("stripe")(config.stripe_secret_key);

//create order with send email notification
const createOrder = async (req: Request) => {
  const { courseId, payment_info } = req.body as IOrder;

  if (payment_info) {
    if ("id" in payment_info) {
      const paymentIntentId = payment_info.id;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      if (paymentIntent.status !== "succeeded") {
        throw new ApiError(400, "Payment not authorized!");
      }
    }
  }

  const user = await User.findById(req.user?._id);
  const courseExistInUser = user?.courses.some(
    (course: any) => course._id.toString() === courseId
  );

  if (courseExistInUser) {
    throw new ApiError(400, "You have already purchased this course");
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }
  const data: any = {
    courseId: course._id,
    userId: user?._id,
  };

  const mailData = {
    order: {
      _id: course._id.toString().slice(0, 6),
      name: course.name,
      price: course.price,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  };
  const html = await ejs.renderFile(
    path.join(__dirname, "../../../mails/order-confirmation.ejs"),
    { order: mailData }
  );
  try {
    if (user) {
      await sendEmail({
        email: user.email,
        subject: "Order Confirmation",
        template: "order-confirmation.ejs",
        data: mailData,
      });
    }
  } catch (error: any) {
    throw new ApiError(400, `${error.message}`);
  }
  user?.courses.push(course?._id);
  await redis.set(req.user?._id, JSON.stringify(user));
  await user?.save();

  await Notification.create({
    user: user?._id,
    title: "New Order",
    message: `You have a new order from ${course?.name}`,
  });
  //   course.purchased ? (course.purchased += 1) : course.purchased;
  //   course.purchased += 1;
  if (course) {
    course.purchased = (course.purchased || 0) + 1;
    await course.save();
  } else {
  }

  await Order.create(data);
  return { order: course };
};

//Get all Orders
const getAllOrders = async () => {
  const orders = await Order.find().sort({ createdAt: -1 });
  return orders;
};
export const OrderService = {
  createOrder,
  getAllOrders,
};
