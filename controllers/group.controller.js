const { Group, Message, User, UserGroup } = require("../models");
const Sequelize = require("sequelize");

module.exports.createGroup = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  try {
    const group = await Group.create({
      name,
      createdByUserId: userId,
    });

    await UserGroup.create({
      userId: Number(userId),
      groupId: group.id,
      isAdmin: true,
    });

    res.status(201).json({
      success: true,
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

module.exports.addMembers = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const currentUserId = req.user.id;
  const { members } = req.body;

  try {
    const isAdmin = await UserGroup.findOne({
      where: {
        userId: currentUserId,
        groupId,
        isAdmin: true,
      },
    });

    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const uniqueIds = [...new Set(members)];

    const memberRecords = uniqueIds.map((userId) => ({
      userId: Number(userId),
      groupId,
      isAdmin: false,
    }));

    await UserGroup.bulkCreate(memberRecords);

    res.status(200).json({ success: true, added: memberRecords });
  } catch (err) {
    console.error("Error in addMembers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getUserGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "username"],
          through: { attributes: ["isAdmin"] },
        },
        {
          model: Message,
          attributes: ["id", "text", "createdAt"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
      where: {
        id: {
          [Sequelize.Op.in]: (
            await UserGroup.findAll({
              where: { userId: req.user.id },
              attributes: ["groupId"],
            })
          ).map((link) => link.groupId),
        },
      },
      order: [[Message, "createdAt", "ASC"]],
    });

    res.status(200).json({ groups });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.toggleAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const currentUserLink = await UserGroup.findOne({
      where: { groupId, userId: currentUserId },
    });

    if (!currentUserLink || !currentUserLink.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only Admin can perform this action" });
    }

    if (parseInt(userId) === currentUserId) {
      return res.status(400).json("You cannot demote yourself");
    }

    const targetLink = await UserGroup.findOne({
      where: { groupId, userId },
    });

    if (!targetLink) {
      return res.status(404).json({ error: "User not in this group" });
    }

    targetLink.isAdmin = !targetLink.isAdmin;
    await targetLink.save();

    res.status(200).json({
      success: `User is now ${targetLink.isAdmin ? "an admin" : "a member"}`,
    });
  } catch (err) {
    console.error("Error in toggleAdmin", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
