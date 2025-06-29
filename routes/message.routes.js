const router = require("express").Router();

const messageController = require("../controllers/message.controller");

router.post("/groups/:id/messages", messageController.sendMessage);
router.get("/groups/:id/messages", messageController.getMessages);

module.exports = router;
