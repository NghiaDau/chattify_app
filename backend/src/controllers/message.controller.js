import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getSocketByUserId } from "../lib/socket.js";
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");
    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
export const getAllContacts = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
export const getMessageByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMesage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMesage.save();

    const receiverSocketId = getSocketByUserId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", newMesage);
    }

    res.status(201).json(newMesage);
  } catch (error) {
    console.error("Error in controler", error);
    return res.status(500).json({ message: "Internal Server" });
  }
};
