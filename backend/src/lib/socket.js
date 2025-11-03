import { Server } from "socket.io";
import http from "http";
import express from "express";
import "dotenv/config";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";
import e from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
io.use(socketAuthMiddleware);

const userSoketMap = {};

export const getSocketByUserId = (userId) => {
  return userSoketMap[userId];
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.fullName}`);
  const userId = socket.userId;
  userSoketMap[userId] = socket.id;

  io.emit("online-users", Object.keys(userSoketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.fullName}`);
    delete userSoketMap[userId];
    io.emit("online-users", Object.keys(userSoketMap));
  });
});

export { server, io, app, userSoketMap };
