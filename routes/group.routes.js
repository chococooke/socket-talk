const router = require("express").Router();

const groupController = require("../controllers/group.controller");

router.get("/groups", groupController.getUserGroups);
router.post("/groups", groupController.createGroup);
router.post("/groups/:id/add-members", groupController.addMembers);

module.exports = router;
