import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.util.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";
import cloudinary from "../lib/cloudinary.js";
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

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User is not existed" });

    const checkPass = await bcrypt.compare(password, user.password);
    if (!checkPass) return res.status(400).json({ message: "Wrong password" });

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};

export const logout = async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "logout succesfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updateUser);
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
