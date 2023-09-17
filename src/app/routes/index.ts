import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { CourseRoutes } from "../modules/courses/courses.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { NotificationRoutes } from "../modules/notifications/notification.routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
