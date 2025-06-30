const { User } = require("../models");

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username"],
    });
    res.status(200).json({ users });
  } catch (err) {
    console.log("Error in getUsers", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
