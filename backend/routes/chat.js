const router = require("express").Router();
const middlewareControllers = require("../controllers/middlewareControllers");
const { getConversationsByUser, getMessagesByConversation, sendMessage } = require("../controllers/chatController");


router.post("/send",middlewareControllers.verifyToken, sendMessage);
router.get("/:userId", middlewareControllers.verifyToken, getConversationsByUser);
router.get("/:conversationId", middlewareControllers.verifyToken, getMessagesByConversation);

module.exports = router;