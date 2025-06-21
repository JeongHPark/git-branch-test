import express from "express";
import { login } from "../authController";
import { refreshAccessToken } from "../tokenUtils";
import { verifyAccessToken } from "../verifyAccessToken";
const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshAccessToken); // 새 accessToken을 발급받는 API

router.get("/protected", verifyAccessToken, (req, res) => {
  res.json({ message: "You are authorized ✅" });
});

export default router;
