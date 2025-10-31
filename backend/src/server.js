import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import path from "path";
dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 3000;

app.use("/api/v1/auth", authRouter);

//make ready for deloyment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () =>
  console.log("Server is running on port " + PORT)
);
