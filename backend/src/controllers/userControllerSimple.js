import User from "../models/userModel.js";
import { successResponse, errorResponse } from "../lib/responseHandler.js";
import {
  parseTimeToMs,
  generateVerificationToken,
  setAuthCookie,
  setRefreshCookie,
  validateUserInput,
  createActivationUrl,
} from "../lib/utils.js";

const login = async (req, res, next) => {
  try {
    validateUserInput({ email: req.body.email, password: req.body.password });

    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const [authToken, refreshToken] = [
      user.generateAuthToken(),
      user.generateRefreshToken(),
    ];
    setRefreshCookie(res, refreshToken);
    setAuthCookie(res, authToken);

    successResponse(res, 200, "Login successful", {
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(
      error.message === "Missing required fields"
        ? errorResponse(res, 400, "Please provide email and password")
        : error
    );
  }
};

const register = async (req, res, next) => {
  try {
    validateUserInput(req.body);

    const existingUser = await User.findOne({ email: req.body.email }).lean();
    if (existingUser) {
      return errorResponse(res, 400, "Email already registered");
    }

    const user = new User({
      ...req.body,
      isVerified: true, // Auto-verify for development
      verificationToken: null,
      verificationTokenExpires: null,
    });

    await user.save();

    // Generate tokens for immediate login
    const [authToken, refreshToken] = [
      user.generateAuthToken(),
      user.generateRefreshToken(),
    ];
    setRefreshCookie(res, refreshToken);
    setAuthCookie(res, authToken);

    successResponse(res, 201, "Successfully registered!", {
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(
      error.message === "Missing required fields"
        ? errorResponse(res, 400, "Please provide name, email, and password")
        : error
    );
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 400, "Verification token is required");
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(res, 400, "Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    successResponse(res, 200, "Email verified successfully");
  } catch (error) {
    next(error);
  }
};

export {
  login,
  register,
  logout,
  verifyEmail,
};
