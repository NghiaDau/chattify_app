import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/v1/auth", authRouter);

app.listen(3000, () => console.log("Server is running on post" + PORT));
