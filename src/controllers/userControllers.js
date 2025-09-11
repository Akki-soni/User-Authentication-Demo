import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendingEmail from "../utils/sendingEmail.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(401).json({
      message: "All Fields are Required",
      success: false,
    });
  }

  try {
    const alreadyregisteredUser = await User.findOne({ email });

    if (alreadyregisteredUser) {
      return res.status(400).json({
        message: "User Already Registered",
        success: false,
      });
    }

    const token = crypto.randomBytes(30).toString("hex");
    console.log(token);

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      emailVerificationToken: token,
      emailVerificationExpiry: Date.now() + 1000 * 60 * 60,
    });

    if (!newUser) {
      return res.status(401).json({
        message: "User Not Registered",
        success: false,
      });
    }

    // Sending Email

    const options = {
      email: email,
      subject: "Email Verification",
      route: "verify",
      token: token,
    };

    await sendingEmail(options);

    return res.status(201).json({
      message: "User Register Successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      message: "Internal Server error",
      success: false,
      error: error.message,
    });
  }
};

const isVerify = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(401).json({
        message: "Token is Required",
        success: false,
      });
    }

    const user = await User.findOne({ emailVerificationToken: token }).select(
      "-password"
    );

    if (!user || user.emailVerificationExpiry < Date.now()) {
      return res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email Verification Successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      message: "Internal Server error",
      success: false,
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({
      message: "All Fields are Required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not Found",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email and Password are Invalid",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: email, _id: user._id },
      process.env.JWT_SECRET
      // { expiresIn: "1h" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
    };

    res.cookie("token", jwtToken, cookieOptions);

    return res.status(200).json({
      message: "User Login Successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (error) {
    console.log("Internal Server Error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
      _id: req.user._id,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not LoggedIn",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get Profile Successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log("Internal Server Error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(401).json({
      message: "Email is Required",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    const token = crypto.randomBytes(30).toString("hex");

    user.resetVerificationToken = token;
    user.resetVerificationExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const options = {
      email: email,
      subject: "Reset Password",
      route: "reset-password",
      token: token,
    };

    await sendingEmail(options);

    return res.status(200).json({
      message: "Forgot Password Successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log("Internal Server Error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params?.token;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Invalid token or Password",
        success: false,
      });
    }

    const user = await User.findOne({ resetVerificationToken: token });
    if (!user || user.resetVerificationExpiry < Date.now()) {
      return res.status(404).json({
        message: "Invalid Token",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.resetVerificationToken = undefined;
    user.resetVerificationExpiry = undefined;
    return res.status(200).json({
      message: "Reset Password Successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (error) {
    console.log("Internal Server Error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  const { name, email, password } = req.body;
};

export {
  registerUser,
  loginUser,
  logoutUser,
  isVerify,
  getProfile,
  forgotPassword,
  resetPassword,
};
