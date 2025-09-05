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
      route: "Verify",
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

const loginUser = async (req, res) => {
  const { name, email, password } = req.body;
};

const logoutUser = async (req, res) => {
  const { name, email, password } = req.body;
};

export { registerUser, loginUser, logoutUser };
