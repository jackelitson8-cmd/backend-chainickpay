const { createChat, getChat, getChatMeta } = require("../services/chatService");
const { HttpError } = require("../utils/httpError");

const createChatController = (req, res) => {
  const { chatId, participants, metadata } = req.body || {};
  const chat = createChat({ chatId, participants, metadata });
  res.status(201).json(getChatMeta(chat));
};

const getChatController = (req, res, next) => {
  const chat = getChat(req.params.chatId);
  if (!chat) {
    return next(new HttpError(404, "Chat nao encontrado ou expirado."));
  }
  return res.status(200).json(getChatMeta(chat));
};

module.exports = { createChatController, getChatController };
