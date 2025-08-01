const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

module.exports.signup = async (req, res) => {
  try {
    Object.values(req.body).forEach((value) => {
      if (typeof value !== "string" || value === "") {
        return res.status(400).json({ error: "Invalid input" });
      }
    });

    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    res.status(201).json({ success: true, userId: user.id });
  } catch (err) {
    console.error("SignUpError", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    Object.values(req.body).forEach((value) => {
      if (typeof value !== "string" || value === "") {
        return res.status(400).json({ error: "Invalid input" });
      }
    });
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.status(401).json({ error: "Wrng password" });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
