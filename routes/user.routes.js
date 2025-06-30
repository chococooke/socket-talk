const { getUsers } = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/users", verifyToken, getUsers);

module.exports = router;
