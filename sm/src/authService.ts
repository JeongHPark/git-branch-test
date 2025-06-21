import { findUserByEmail } from "./userModel";
import { generateAccessToken, generateRefreshToken } from "./tokenUtils";

export const loginUser = async (email: string, password: string) => {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { error: "Invalid credentials" };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  console.log(accessToken, refreshToken);
  return { accessToken, refreshToken };
};
