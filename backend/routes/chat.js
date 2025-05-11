const router = require("express").Router();
const middlewareControllers = require("../controllers/middlewareControllers");
const { getConversationsByUser, getMessagesByConversation, searchConversationsByUser, hideConversation, toggleConversationsVisibility, getFilteredConversations } = require("../controllers/chatController");
const { suggestQuestions } = require("../controllers/aiController");

router.get("/user/:userId", middlewareControllers.verifyToken, getConversationsByUser);
router.get("/chat/:conversationId", middlewareControllers.verifyToken, getMessagesByConversation);
router.get("/search/:userId", middlewareControllers.verifyToken, searchConversationsByUser);
router.patch("/visibility",middlewareControllers.verifyToken, toggleConversationsVisibility);
router.get("/filter/:userId", middlewareControllers.verifyToken, getFilteredConversations);
router.post('/suggest-questions',middlewareControllers.verifyToken, suggestQuestions);

module.exports = router;