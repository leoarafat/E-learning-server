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
const registrationUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = payload;
    const user = {
        name,
        email,
        password,
    };
    const isEmailExist = yield user_model_1.default.findOne({ email });
    if (isEmailExist) {
        throw new ApiError_1.default(400, "Email already exist");
    }
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };
    const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../../../mails/activation-mail.ejs"), data);
    try {
        yield (0, sendMail_1.default)({
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
});
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
const activateUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { activation_code, activation_token } = payload;
    const newUser = jsonwebtoken_1.default.verify(activation_token, config_1.default.activation_secret);
    if (newUser.activationCode !== activation_code) {
        throw new ApiError_1.default(400, "Activation code is not valid");
    }
    const { name, email, password } = newUser.user;
    const existUser = yield user_model_1.default.findOne({ email });
    if (existUser) {
        throw new ApiError_1.default(400, "Email is already exist");
    }
    const user = yield user_model_1.default.create({
        name,
        email,
        password,
    });
    return user;
});
//Login User
const loginUser = (payload, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    if (!email || !password) {
        throw new ApiError_1.default(400, "Please enter your email and password");
    }
    const user = yield user_model_1.default.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const isPasswordMatch = yield user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new ApiError_1.default(400, "Invalid email or password");
    }
    (0, jwt_1.sendToken)(user, 200, res);
});
//Logout user
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null;
    redis_1.redis.del(userId);
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
const updateAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refresh_token = req.cookies.refresh_token;
    const decoded = jsonwebtoken_1.default.verify(refresh_token, config_1.default.jwt.refresh_token);
    const message = "Could not refresh token";
    if (!decoded) {
        throw new ApiError_1.default(400, message);
    }
    const session = yield redis_1.redis.get(decoded.id);
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
    yield redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800);
    res.status(200).json({
        status: "success",
        accessToken,
    });
});
//Get user by id
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const result = yield redis_1.redis.get(userId);
    if (result) {
        const user = JSON.parse(result);
        return user;
    }
});
const socialAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, avatar } = req.body;
    const user = yield user_model_1.default.findOne({ email });
    if (!user) {
        const newUser = yield user_model_1.default.create({
            email,
            name,
            avatar,
        });
        (0, jwt_1.sendToken)(newUser, 200, res);
    }
    else {
        (0, jwt_1.sendToken)(user, 200, res);
    }
});
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { name, email } = req.body;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    const user = yield user_model_1.default.findById(userId);
    if (email && user) {
        const isEmailExist = yield user_model_1.default.findOne({ email });
        if (isEmailExist) {
            throw new ApiError_1.default(404, "Email already exist");
        }
        user.email = email;
    }
    if (name && user) {
        user.name = name;
    }
    yield (user === null || user === void 0 ? void 0 : user.save());
    yield redis_1.redis.set(userId, JSON.stringify(user));
    res.status(200).json({
        success: true,
        user,
    });
});
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError_1.default(400, "Please enter your old and new password");
    }
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const user = yield user_model_1.default.findById(userId).select("+password");
    if (!user || user.password === undefined) {
        throw new ApiError_1.default(400, "Invalid user");
    }
    const isPasswordMatch = yield (user === null || user === void 0 ? void 0 : user.comparePassword(oldPassword || ""));
    if (!isPasswordMatch) {
        throw new ApiError_1.default(400, "Invalid old password");
    }
    user.password = newPassword;
    yield user.save();
    yield redis_1.redis.set(userId, JSON.stringify(user));
    res.status(201).json({
        success: true,
        user,
    });
});
const updateProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g;
    const { avatar } = req.body;
    const userId = (_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e._id;
    const user = yield user_model_1.default.findById(userId);
    if (avatar && user) {
        if ((_f = user === null || user === void 0 ? void 0 : user.avatar) === null || _f === void 0 ? void 0 : _f.public_id) {
            yield cloudinary_1.default.v2.uploader.destroy((_g = user === null || user === void 0 ? void 0 : user.avatar) === null || _g === void 0 ? void 0 : _g.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.url,
            };
        }
        else {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.url,
            };
        }
    }
    yield (user === null || user === void 0 ? void 0 : user.save());
    yield redis_1.redis.set(userId, JSON.stringify(user));
    res.status(200).json({
        success: true,
        user,
    });
});
//Get all user
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().sort({ createdAt: -1 });
    return users;
});
//Update user role only for admin
const updateUserRole = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.body;
    const result = yield user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
    return result;
});
//delete user role only for admin
const deleteUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_model_1.default.findById(id);
    if (!result) {
        throw new ApiError_1.default(404, "User not found");
    }
    yield result.deleteOne({ id });
    yield redis_1.redis.del(id);
});
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
