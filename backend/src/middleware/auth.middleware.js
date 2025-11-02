import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const protecRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provider" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    const user = await User.findById({ _id: decoded.userId }).select(
      "-password"
    );
    req.user = user;
    next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
