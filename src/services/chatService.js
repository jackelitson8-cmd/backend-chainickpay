const { v4: uuidv4 } = require("uuid");
const { env } = require("../config/env");

const CHAT_TTL_MS = Math.max(1, env.chatTtlHours) * 60 * 60 * 1000;
const MAX_MESSAGES = env.chatMaxMessages;

const chats = new Map();

function createChat({ chatId, participants = [], metadata = {} } = {}) {
  const id = chatId || uuidv4();
  const now = Date.now();
  const chat = {
    id,
    createdAt: now,
    expiresAt: now + CHAT_TTL_MS,
    participants: new Set(participants.filter(Boolean)),
    metadata,
    messages: [],
  };

  chats.set(id, chat);
  return chat;
}

function isExpired(chat) {
  return Date.now() >= chat.expiresAt;
}

function getChat(chatId) {
  const chat = chats.get(chatId);
  if (!chat) return null;
  if (isExpired(chat)) {
    chats.delete(chatId);
    return null;
  }
  return chat;
}

function getChatMeta(chat) {
  return {
    chatId: chat.id,
    createdAt: chat.createdAt,
    expiresAt: chat.expiresAt,
    participants: Array.from(chat.participants),
    messageCount: chat.messages.length,
    metadata: chat.metadata,
  };
}

function addParticipant(chat, participant) {
  if (!participant) return;
  chat.participants.add(participant);
}

function addMessage(chatId, message) {
  const chat = getChat(chatId);
  if (!chat) return null;

  chat.messages.push(message);

  if (chat.messages.length > MAX_MESSAGES) {
    chat.messages.splice(0, chat.messages.length - MAX_MESSAGES);
  }

  return message;
}

function listMessages(chatId) {
  const chat = getChat(chatId);
  return chat ? chat.messages : null;
}

function pruneExpired() {
  for (const [id, chat] of chats.entries()) {
    if (isExpired(chat)) {
      chats.delete(id);
    }
  }
}

module.exports = {
  createChat,
  getChat,
  getChatMeta,
  addParticipant,
  addMessage,
  listMessages,
  pruneExpired,
};
