import { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import config from "./config";
require("dotenv").config();

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.cloud_api_key,
  api_secret: config.cloud_api_secret,
});

process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

let server: Server;
async function main() {
  try {
    await mongoose.connect(process.env.DB_URL as string);
    console.log("DB Connected on Successfully");
    server = app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
  process.on("unhandledRejection", (error) => {
    if (server) {
      server.close(() => {
        console.log(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}
main().catch((err) => console.log(err));

process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close();
  }
});
