const { Message, User } = require("../models");

module.exports.sendMessage = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { text, userId } = req.body;

  try {
    const message = await Message.create({
      text,
      groupId,
      userId,
    });

    res.status(201).json({ sucess: true, message });
  } catch (err) {
    console.error("Error in sendMessage", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getMessages = async (req, res) => {
  const groupId = parseInt(req.params.id);

  try {
    const messages = await Message.findAll({
      where: { groupId },
      include: {
        model: User,
        attributes: ["id", "username"],
      },
      attributes: ["id", "text", "groupId", "createdAt"],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
