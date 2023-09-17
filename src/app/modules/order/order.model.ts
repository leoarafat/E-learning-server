import mongoose, { Model, Schema } from "mongoose";
import { IOrder } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
const Order: Model<IOrder> = mongoose.model("Order", orderSchema);

export default Order;
