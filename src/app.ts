import express, { Application } from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { NotFoundHandler } from "./errors/NotFoundHandler ";
require("dotenv").config();
export const app: Application = express();
//cors
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);
//cookie
app.use(cookieParser());

//parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

//All Routes
// app.use('/api/v1', routes);

// Global Error Handler
app.use(globalErrorHandler);

// handle not found
app.use(NotFoundHandler.handle);
