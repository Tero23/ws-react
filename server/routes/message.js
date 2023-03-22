const router = require("express").Router();
const messageController = require("../controllers/message");

router.post("/", messageController.createMessage);

router.get("/:roomId", messageController.getAllMessagesOfARoom);

module.exports = router;
