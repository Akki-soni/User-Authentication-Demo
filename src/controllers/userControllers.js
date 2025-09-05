import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendingEmail from "../utils/sendingEmail.js";

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
  const { name, email, password } = req.body;
};

const logoutUser = async (req, res) => {
  const { name, email, password } = req.body;
};

export { registerUser, loginUser, logoutUser, isVerify };
