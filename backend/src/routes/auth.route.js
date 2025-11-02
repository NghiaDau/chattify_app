import express from "express";
import { signup } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", (res, req) => {});
router.post("/logout", (res, req) => {});

export default router;
