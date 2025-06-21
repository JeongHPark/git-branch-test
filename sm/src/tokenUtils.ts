import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  validateRefreshToken,
  removeRefreshToken,
  saveRefreshToken,
} from "./tokenStore"; // 🔥 올바른 import

const ACCESS_SECRET = "access-secret-key";
const REFRESH_SECRET = "refresh-secret-key";

interface UserPayload {
  id: number;
}

// AccessToken 생성
export const generateAccessToken = (user: UserPayload) => {
  return jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: "1m" });
};

// RefreshToken 생성
export const generateRefreshToken = (user: UserPayload) => {
  return jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
};

// refreshToken을 기반으로 AccessToken 재발급
export const refreshAccessToken = (req: Request, res: Response) => {
  // 프론트에서 받아온 값이다. -> AccessToken은 왜 만료되었지 여부 판단을 안하는지?
  // RefreshToken도 만료가 되었는지?
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: "No refresh token provided",
      requiresLogin: true, // 🔥 추가: 클라이언트에게 재로그인 필요함을 알림
    });
  }

  try {
    // 1. JWT 형식 검증 (기존 코드)
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as any;
    const userId = decoded.userId;

    // 🔥 2. 추가: 서버에 저장된 토큰과 비교 (보안 강화)
    if (!validateRefreshToken(userId, refreshToken)) {
      return res.status(403).json({
        error: "Invalid or expired refresh token",
        requiresLogin: true, // 🔥 추가: 재로그인 필요
      });
    }

    // 🔥 3. 추가: 기존 refresh token 삭제 (보안을 위해)
    removeRefreshToken(userId);

    // 4. 새 토큰들 발급 (기존 코드 + 개선)
    const newAccessToken = jwt.sign({ userId }, ACCESS_SECRET, {
      expiresIn: "1m",
    });

    // 🔥 5. 추가: 새 refresh token도 발급 (보안 강화)
    const newRefreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 🔥 6. 추가: 새 refresh token 저장
    saveRefreshToken(userId, newRefreshToken);

    // 7. 응답 (기존 코드 + 개선)
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // 🔥 추가: 새 refresh token도 반환
    });
  } catch (err) {
    // 🔥 8. 추가: 더 구체적인 에러 처리
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        error: "Refresh token expired",
        requiresLogin: true,
      });
    }

    return res.status(403).json({
      error: "Invalid refresh token format",
      requiresLogin: true,
    });
  }
};