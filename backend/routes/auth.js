const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const auth = require("../models/user");
const OTP = require("../models/OTP");
const genrateOtp = require("../utils/generateOtp");
const nodemailer = require("nodemailer");
const { genrateAccessToken, genrateRefreshToken } = require("../utils/generateTokens");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();
router.use(express.json());

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

// Helper function to set both tokens in cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie (short-lived)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
    sameSite: "Lax",
    path: "/",
  });

  // Set refresh token cookie (long-lived)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (more reasonable than 365 days)
    sameSite: "Lax",
    path: "/",
  });
};

// Validate OTP and create user
router.post("/validateotp", async (req, res) => {
  const { email, otp, name, username, password } = req.body;
  
  try {
    const verifyotp = await OTP.findOne({ email });

    if (!verifyotp) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (verifyotp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingUser = await auth.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const User = new auth({ username, name, email, password });
    await User.save();

    await OTP.deleteOne({ email });

    const accessToken = genrateAccessToken(User);
    const refreshToken = genrateRefreshToken(User);

    // Set both tokens in cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Signup success",
      user: {
        _id: User._id,
        username: User.username,
        name: User.name,
        email: User.email,
        profileimg: User.profileimg,
        bio: User.bio || "",
      },
    });
  } catch (err) {
    console.error("OTP validation error:", err);
    res.status(400).json({ message: "OTP verification failed" });
  }
});

// Google OAuth
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await auth.findOne({ email });

    if (user) {
      const accessToken = genrateAccessToken(user);
      const refreshToken = genrateRefreshToken(user);

      // Set both tokens in cookies
      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        message: "Login success",
        user: {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profileimg: user.profileimg,
          bio: user.bio || "",
        },
      });
    } else {
      res.status(200).json({
        message: "New user, proceed to signup",
        user: {
          email,
          name,
          picture,
        },
      });
    }
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, name, email, password, google } = req.body;

  try {
    if (google) {
      const existingUser = await auth.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const User = new auth({ username, name, email, password: null });
      await User.save();

      const accessToken = genrateAccessToken(User);
      const refreshToken = genrateRefreshToken(User);
      
      // Set both tokens in cookies
      setAuthCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        message: "Signup success",
        user: {
          _id: User._id,
          username: User.username,
          name: User.name,
          email: User.email,
          profileimg: User.profileimg,
          bio: User.bio || "",
        }
      });
    }

    const userExists = await auth.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = genrateOtp();
    await OTP.deleteOne({ email });
    await OTP.create({ email, otp });

    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                  <tr>
                    <td style="background-color: #000000; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Email Verification</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">Thank you for signing up! Please use the following OTP code to verify your email address:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <div style="background-color: #000000; border-radius: 8px; padding: 20px; display: inline-block;">
                              <span style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                        This code will expire in <strong style="color: #000000;">5 minutes</strong>
                      </p>
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated message, please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;

    const identifyuser = await auth.findOne({
      $or: [{ username: user }, { email: user }],
    });

    if (!identifyuser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const comparepassword = await identifyuser.comparepass(password);
    if (!comparepassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = genrateAccessToken(identifyuser);
    const refreshToken = genrateRefreshToken(identifyuser);

    // Set both tokens in cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login success",
      user: {
        _id: identifyuser._id,
        username: identifyuser.username,
        name: identifyuser.name,
        email: identifyuser.email,
        profileimg: identifyuser.profileimg,
        bio: identifyuser.bio || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Refresh token endpoint - NEW!
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = await auth.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new tokens
    const newAccessToken = genrateAccessToken(user);

    // Set new tokens in cookies
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
    sameSite: "Lax",
  });
  
  res.json({ message: "Access token refreshed" });
  }
  catch (err) {
    console.error("Token refresh error:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  // Clear both cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
  
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
  
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;