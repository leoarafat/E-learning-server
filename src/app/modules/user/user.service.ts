import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import sendEmail from "../../../utils/sendMail";
import { IActivationToken, IRegistration, IUser } from "./user.interface";
import User from "./user.model";
import ejs from "ejs";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
const registrationUser = async (payload: IRegistration) => {
  const { name, email, password } = payload;
  const user = {
    name,
    email,
    password,
  };

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    throw new ApiError(400, "Email already exist");
  }

  const activationToken = createActivationToken(user);
  const activationCode = activationToken.activationCode;
  const data = { user: { name: user.name }, activationCode };
  const html = await ejs.renderFile(
    path.join(__dirname, "../../../mails/activation-mail.ejs"),
    data
  );
  try {
    await sendEmail({
      email: user.email,
      subject: "Activate Your Account",
      template: "activation-mail.ejs",
      data,
    });
  } catch (error) {
    console.log(error);
  }
  return {
    activationToken: activationToken.token,
    user,
  };
};

const createActivationToken = (user: IRegistration): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    config.activation_secret as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

export const UserService = {
  registrationUser,
  createActivationToken,
};
