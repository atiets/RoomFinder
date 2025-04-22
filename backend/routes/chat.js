const router = require("express").Router();
const middlewareControllers = require("../controllers/middlewareControllers");
const { getConversationsByUser, getMessagesByConversation, searchConversationsByUser } = require("../controllers/chatController");

router.get("/user/:userId", middlewareControllers.verifyToken, getConversationsByUser);
router.get("/chat/:conversationId", middlewareControllers.verifyToken, getMessagesByConversation);
router.get("/search/:userId", middlewareControllers.verifyToken, searchConversationsByUser);

module.exports = router;