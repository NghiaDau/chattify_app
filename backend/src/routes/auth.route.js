import express from "express";
const router = express.Router();

router.get("/signup", (req, res) => {
  res.send("Signup endpoit");
});
router.post("/login", (res, req) => {});
router.post("/logout", (res, req) => {});

export default router;
