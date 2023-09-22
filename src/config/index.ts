import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DB_URL,
  redis_url: process.env.REDIS_URL,
  origin_url: process.env.ORIGIN,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_api_secret: process.env.CLOUD_API_SECRET,
  redis_expires_in: process.env.REDIS_TOKEN_EXPIRES_IN,
  activation_secret: process.env.ACTIVATION_SECRET,
  video_cipher_api_key: process.env.VIDEO_CIPHER_API_SECRET,
  jwt: {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    access_token_expires: process.env.ACCESS_TOKEN_EXPIRES,
    refresh_token_expires: process.env.REFRESH_TOKEN_EXPIRES,
  },
  smtp: {
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_service: process.env.SMTP_SERVICE,
    smtp_mail: process.env.SMTP_MAIL,
    smtp_password: process.env.SMTP_PASSWORD,
  },
};
