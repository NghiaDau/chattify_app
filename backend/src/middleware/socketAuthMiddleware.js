import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((c) => c.startsWith("jwt="))
      ?.split("=")[1];
    if (!token) {
      return next(new Error("Unauthorized - No token provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized - Invalid token"));
    }
    const user = await User.findById({ _id: decoded.userId }).select(
      "-password"
    );
    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error("Unauthorized - Invalid token"));
  }
};
