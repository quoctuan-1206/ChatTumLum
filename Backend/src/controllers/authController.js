import brypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const singUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: "Không đủ thông tin" });
    }
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: "Tên người dùng đã tồn tại" });
    }
    const hashedPassword = await brypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    return res.status(204);
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Không đủ thông tin" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Tên người dùng hoặc mật khẩu không đúng" });
    }
    const passwordCorrect = await brypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Tên người dùng hoặc mật khẩu không đúng" });
    }
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });
    return res.status(200).json({
      message: `User ${user.username} signed in successfully`,
      accessToken,
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.findOneAndDelete({ refreshToken: token });
      res.clearCookie("refreshToken");
    }
    return res.status(204).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Error during sign out:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
