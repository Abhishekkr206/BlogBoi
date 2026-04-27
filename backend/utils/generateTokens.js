const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const genrateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id},
        JWT_SECRET,
        { expiresIn: "15m" }
    )
}
const genrateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id},
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    )
}

module.exports = { genrateAccessToken, genrateRefreshToken };