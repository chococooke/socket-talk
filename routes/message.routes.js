const router = require("express").Router();

const messageController = require("../controllers/message.controller");
const { verifyToken } = require("../middlewares/auth");

router.post("/groups/:id/messages", verifyToken, messageController.sendMessage);
router.get("/groups/:id/messages", verifyToken, messageController.getMessages);

module.exports = router;
