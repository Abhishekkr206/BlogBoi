const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const auth = require("../models/user");
const OTP = require("../models/OTP");
const genrateOtp = require("../utils/generateOtp");
const nodemailer = require("nodemailer");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
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

    // Check if user already exists
    const existingUser = await auth.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const User = new auth({ username, name, email, password });
    await User.save();

    // Delete used OTP
    await OTP.deleteOne({ email });

    // Generate JWT
    const token = jwt.sign({ id: User._id }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      path: "/",
    });

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
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if user exists
    let user = await auth.findOne({ email });

    if (user) {
      // Existing user - login
      const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
        path: "/",
      });

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
      // New user - send data for username selection
      res.status(200).json({
        message: "New user, proceed to signup",
        user: {
          email,
          name,
          picture ,
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
    // Handle Google signup completion
    if (google) {
      const existingUser = await auth.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const User = new auth({ username, name, email, password: null });
      await User.save();

      const token = jwt.sign({ id: User._id }, JWT_SECRET, { expiresIn: "1d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
        path: "/"
      });

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

    // Regular email/password signup - send OTP
    const userExists = await auth.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = genrateOtp();
    
    // Delete existing OTP
    await OTP.deleteOne({ email });
    
    // Create new OTP
    await OTP.create({ email, otp });

    // Send email
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
              
              <!-- Header -->
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Email Verification</h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">Thank you for signing up! Please use the following OTP code to verify your email address:</p>
                  
                  <!-- OTP Box -->
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
              
              <!-- Footer -->
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

    const token = jwt.sign({ id: identifyuser._id }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      path: "/",
    });

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

// Logout
router.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;