const router = require("express").Router();

const groupController = require("../controllers/group.controller");
const { verifyToken } = require("../middlewares/auth");

router.get("/groups", verifyToken, groupController.getUserGroups);
router.post("/groups", verifyToken, groupController.createGroup);
router.post("/groups/:id/add-members", verifyToken, groupController.addMembers);

module.exports = router;
