import express from "express";
const router = express.Router();
import {
  getAllContacts,
  getChatPartners,
  getMessageByUserId,
  sendMessage,
} from "../controllers/message.controller.js";
import { protecRoute } from "../middleware/auth.middleware.js";
router.get("/contacts", protecRoute, getAllContacts);
router.get("/chats", protecRoute, getChatPartners);
router.get("/:id", protecRoute, getMessageByUserId);
router.post("/send/:id", protecRoute, sendMessage);

export default router;
