// Import required modules
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const auth = require("../models/user");          // User model
const OTP = require("../models/OTP");            // OTP model
const genrateOtp = require("../utils/generateOtp");
const nodemailer = require("nodemailer");
const { genrateAccessToken, genrateRefreshToken } = require("../utils/generateTokens");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

// JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Express router setup
const router = express.Router();
router.use(express.json());

// Email transport config for sending OTP mails
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

// Upload Google profile picture to Cloudinary
const uploadGoogleImageToCloudinary = async (imageUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "blogBoiUserInfo"
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading Google image to Cloudinary:", error);
    return imageUrl; // Use original URL if upload fails
  }
};

// Store access & refresh tokens in cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token (15 mins)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
    sameSite: "Lax",
    path: "/",
  });

  // Refresh token (7 days)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Lax",
    path: "/",
  });
};

// Validate OTP & create user
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

// Google OAuth login / signup check
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();
    let user = await auth.findOne({ email });

    // Existing user → login
    if (user) {
      const accessToken = genrateAccessToken(user);
      const refreshToken = genrateRefreshToken(user);

      setAuthCookies(res, accessToken, refreshToken);

      return res.status(200).json({
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
    }

    // New user → send data to frontend for signup
    res.status(200).json({
      message: "New user, proceed to signup",
      user: { email, name, picture },
    });

  } catch (err) {
    console.error("Google auth error:", err);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

// Signup (normal + Google signup flow)
router.post("/signup", async (req, res) => {
  const { username, name, email, password, google, profileimg } = req.body;

  try {
    // If signup via Google
    if (google) {
      const existingUser = await auth.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      let cloudinaryUrl = null;
      if (profileimg) {
        cloudinaryUrl = await uploadGoogleImageToCloudinary(profileimg);
      }

      const User = new auth({
        profileimg: cloudinaryUrl,
        username,
        name,
        email,
        password: null  // Google users have no password
      });

      await User.save();

      const accessToken = genrateAccessToken(User);
      const refreshToken = genrateRefreshToken(User);
      
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

    // Normal signup → send OTP email
    const userExists = await auth.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = genrateOtp();
    await OTP.deleteOne({ email });
    await OTP.create({ email, otp });

    // Send OTP via email
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `... HTML EMAIL TEMPLATE ...`
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

    // Allow login via username OR email
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

// Refresh access token using refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await auth.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = genrateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      sameSite: "Lax",
    });
    
    res.json({ message: "Access token refreshed" });

  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout → clear both cookies
router.post("/logout", async (req, res) => {
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
