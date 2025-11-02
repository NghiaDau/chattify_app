import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.util.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPassword, // đổi lại field đúng
    });

    const saveUser = await newUser.save();
    generateToken(saveUser._id, res);
    try {
      await sendWelcomeEmail(
        saveUser.email,
        saveUser.fullName,
        process.env.CLIENT_URL
      );
    } catch (error) {
      console.error("failed", error);
    }

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
