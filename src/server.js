const http = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config/env");
const {
  addMessage,
  addParticipant,
  createChat,
  getChat,
  getChatMeta,
  listMessages,
  pruneExpired,
} = require("./services/chatService");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    methods: ["GET", "POST"],
  },
});

const PRUNE_INTERVAL_MS = 60 * 1000;
setInterval(pruneExpired, PRUNE_INTERVAL_MS);

io.on("connection", (socket) => {
  socket.on("chat:join", (payload = {}) => {
    const { chatId, userId, userName, createIfMissing } = payload;

    if (!chatId || typeof chatId !== "string") {
      socket.emit("chat:error", { message: "chatId invalido." });
      return;
    }

    let chat = getChat(chatId);

    if (!chat) {
      if (!createIfMissing) {
        socket.emit("chat:expired", { chatId });
        return;
      }

      chat = createChat({
        chatId,
        participants: userId ? [userId] : [],
        metadata: { createdBy: userName || userId || "desconhecido" },
      });
    }

    addParticipant(chat, userId);
    socket.join(chatId);

    socket.emit("chat:meta", getChatMeta(chat));

    const history = listMessages(chatId) || [];
    socket.emit("chat:history", history);
  });

  socket.on("chat:message", (payload = {}) => {
    const { chatId, text, senderId, senderName } = payload;

    if (!chatId || typeof chatId !== "string") return;

    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed) return;

    const chat = getChat(chatId);
    if (!chat) {
      socket.emit("chat:expired", { chatId });
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      chatId,
      text: trimmed.slice(0, 500),
      senderId: senderId || "unknown",
      senderName: senderName || "Anonimo",
      createdAt: new Date().toISOString(),
    };

    addMessage(chatId, message);
    io.to(chatId).emit("chat:message", message);
  });
});

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running at http://localhost:${env.port}`);
});
