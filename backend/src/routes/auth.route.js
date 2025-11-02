import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protecRoute } from "../middleware/auth.middleware.js";
import { arcjetProtetion } from "../middleware/arcjet.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protecRoute, updateProfile);
router.get("/check", protecRoute, (req, res) => {
  res.json({ message: "check ok" });
});
router.get("/check_arcjet", arcjetProtetion, (req, res) => {
  res.json({ message: "check ok" });
});

export default router;
