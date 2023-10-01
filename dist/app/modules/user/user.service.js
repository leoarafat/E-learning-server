"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwt_1 = require("../../../utils/jwt");
const sendMail_1 = __importDefault(require("../../../utils/sendMail"));
const user_model_1 = __importDefault(require("./user.model"));
const ejs_1 = __importDefault(require("ejs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const redis_1 = require("../../../utils/redis");
const cloudinary_1 = __importDefault(require("cloudinary"));
const registrationUser = async (payload) => {
    const { name, email, password } = payload;
    const user = {
        name,
        email,
        password,
    };
    const isEmailExist = await user_model_1.default.findOne({ email });
    if (isEmailExist) {
        throw new ApiError_1.default(400, "Email already exist");
    }
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };
    const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/activation-mail.ejs"), data);
    try {
        await (0, sendMail_1.default)({
            email: user.email,
            subject: "Activate Your Account",
            template: "activation-mail.ejs",
            data,
        });
    }
    catch (error) {
        throw new ApiError_1.default(500, `${error.message}`);
    }
    return {
        activationToken: activationToken.token,
        user,
    };
};
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user,
        activationCode,
    }, config_1.default.activation_secret, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
const activateUser = async (payload) => {
    const { activation_code, activation_token } = payload;
    const newUser = jsonwebtoken_1.default.verify(activation_token, config_1.default.activation_secret);
    if (newUser.activationCode !== activation_code) {
        throw new ApiError_1.default(400, "Activation code is not valid");
    }
    const { name, email, password } = newUser.user;
    const existUser = await user_model_1.default.findOne({ email });
    if (existUser) {
        throw new ApiError_1.default(400, "Email is already exist");
    }
    const user = await user_model_1.default.create({
        name,
        email,
        password,
    });
    return user;
};
//Login User
const loginUser = async (payload, res) => {
    const { email, password } = payload;
    if (!email || !password) {
        throw new ApiError_1.default(400, "Please enter your email and password");
    }
    const user = await user_model_1.default.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new ApiError_1.default(400, "Invalid email or password");
    }
    (0, jwt_1.sendToken)(user, 200, res);
};
//Logout user
const logoutUser = async (req, res) => {
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });
    const userId = req.user?._id || null;
    redis_1.redis.del(userId);
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
const updateAccessToken = async (req, res, next) => {
    const refresh_token = req.cookies.refresh_token;
    const decoded = jsonwebtoken_1.default.verify(refresh_token, config_1.default.jwt.refresh_token);
    const message = "Could not refresh token";
    if (!decoded) {
        throw new ApiError_1.default(400, message);
    }
    const session = await redis_1.redis.get(decoded.id);
    if (!session) {
        throw new ApiError_1.default(400, "Please login to access this resource");
    }
    const user = JSON.parse(session);
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, config_1.default.jwt.access_token, {
        expiresIn: "5m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, config_1.default.jwt.refresh_token, {
        expiresIn: "3d",
    });
    req.user = user;
    res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
    await redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800);
    next();
};
//Get user by id
const getUserById = async (req, res) => {
    const userId = req.user?._id;
    const result = await redis_1.redis.get(userId);
    if (result) {
        const user = JSON.parse(result);
        return user;
    }
};
const socialAuth = async (req, res) => {
    const { name, email, avatar } = req.body;
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        const newUser = await user_model_1.default.create({
            email,
            name,
            avatar,
        });
        (0, jwt_1.sendToken)(newUser, 200, res);
    }
    else {
        (0, jwt_1.sendToken)(user, 200, res);
    }
};
const updateUserInfo = async (req, res) => {
    const { name } = req.body;
    const userId = req.user?._id;
    const user = await user_model_1.default.findById(userId);
    if (name && user) {
        user.name = name;
    }
    await user?.save();
    await redis_1.redis.set(userId, JSON.stringify(user));
    res.status(200).json({
        success: true,
        user,
    });
};
const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError_1.default(400, "Please enter your old and new password");
    }
    const userId = req.user?._id;
    const user = await user_model_1.default.findById(userId).select("+password");
    if (!user || user.password === undefined) {
        throw new ApiError_1.default(400, "Invalid user");
    }
    const isPasswordMatch = await user?.comparePassword(oldPassword || "");
    if (!isPasswordMatch) {
        throw new ApiError_1.default(400, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    await redis_1.redis.set(userId, JSON.stringify(user));
    res.status(201).json({
        success: true,
        user,
    });
};
const updateProfilePicture = async (req, res) => {
    const { avatar } = req.body;
    const userId = req?.user?._id;
    const user = await user_model_1.default.findById(userId);
    if (avatar && user) {
        if (user?.avatar?.public_id) {
            await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.url,
            };
        }
        else {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.url,
            };
        }
    }
    await user?.save();
    await redis_1.redis.set(userId, JSON.stringify(user));
    res.status(200).json({
        success: true,
        user,
    });
};
//Get all user
const getAllUsers = async () => {
    const users = await user_model_1.default.find().sort({ createdAt: -1 });
    return users;
};
//Update user role only for admin
const updateUserRole = async (req) => {
    const { id, role } = req.body;
    const result = await user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
    return result;
};
//delete user role only for admin
const deleteUser = async (req) => {
    const { id } = req.params;
    const result = await user_model_1.default.findById(id);
    if (!result) {
        throw new ApiError_1.default(404, "User not found");
    }
    await result.deleteOne({ id });
    await redis_1.redis.del(id);
};
exports.UserService = {
    registrationUser,
    createActivationToken,
    activateUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserById,
    socialAuth,
    updateUserInfo,
    updateUserPassword,
    updateProfilePicture,
    getAllUsers,
    updateUserRole,
    deleteUser,
};
