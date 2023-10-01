"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.smtp.smtp_host,
        port: parseInt(config_1.default.smtp.smtp_port || "587"),
        service: config_1.default.smtp.smtp_service,
        auth: {
            user: config_1.default.smtp.smtp_mail,
            pass: config_1.default.smtp.smtp_password,
        },
    });
    const { email, subject, template, data } = options;
    const templatePath = path_1.default.join(__dirname, "../mails", template);
    const html = await ejs_1.default.renderFile(templatePath, data);
    const mailOptions = {
        from: config_1.default.smtp.smtp_mail,
        to: email,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
};
exports.default = sendEmail;
