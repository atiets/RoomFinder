const router = require("express").Router();
const middlewareControllers = require("../controllers/middlewareControllers");
const { getConversationsByUser, getMessagesByConversation, searchConversationsByUser, hideConversation, toggleConversationsVisibility, getFilteredConversations, getConversationsByAdmin, getMessagesWithBot } = require("../controllers/chatController");
const { suggestQuestions } = require("../controllers/aiController");

router.get("/user/:userId", middlewareControllers.verifyToken, getConversationsByUser);
router.get("/chat/:conversationId", middlewareControllers.verifyToken, getMessagesByConversation);
router.get("/search/:userId", middlewareControllers.verifyToken, searchConversationsByUser);
router.patch("/visibility",middlewareControllers.verifyToken, toggleConversationsVisibility);
router.get("/filter/:userId", middlewareControllers.verifyToken, getFilteredConversations);
router.post('/suggest-questions',middlewareControllers.verifyToken, suggestQuestions);
router.get("/admin/listConversations/:adminId", middlewareControllers.verifyTokenAndAdminAuth, getConversationsByAdmin);
router.get("/user/messageswithBot/:userId", middlewareControllers.verifyToken, getMessagesWithBot);

module.exports = router;