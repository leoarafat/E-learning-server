"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("./config"));
require("dotenv").config();
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloud_name,
    api_key: config_1.default.cloud_api_key,
    api_secret: config_1.default.cloud_api_secret,
});
process.on("uncaughtException", (error) => {
    console.log(error);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.DB_URL);
            console.log("DB Connected on Successfully");
            server = app_1.app.listen(process.env.PORT, () => {
                console.log(`Example app listening on port ${process.env.PORT}`);
            });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
        process.on("unhandledRejection", (error) => {
            if (server) {
                server.close(() => {
                    console.log(error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
main().catch((err) => console.log(err));
process.on("SIGTERM", () => {
    console.log("SIGTERM is received");
    if (server) {
        server.close();
    }
});
