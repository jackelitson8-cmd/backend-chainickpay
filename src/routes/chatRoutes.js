const { Router } = require("express");
const { createChatController, getChatController } = require("../controllers/chatController");

const chatRoutes = Router();

chatRoutes.post("/", createChatController);
chatRoutes.get("/:chatId", getChatController);

module.exports = { chatRoutes };
