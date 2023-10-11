const authSocket = require("./middleware/authSocket");
const newConnectionHandler = require("./sockerHandlers/newConnectionHandler");
const disconnectHandler = require("./sockerHandlers/disconnectHandler");
const directMessageHandler = require("./sockerHandlers/directMessageHandler");
const directChatHistoryHandler = require("./sockerHandlers/directChatHistoryHandler");

const serverStore = require("./serverStore");

const registerSockerServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlinerUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    console.log("user conne", socket.id);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on('direct-message', data => {
      directMessageHandler(socket, data)
    })

    socket.on('direct-chat-history', data => {
      console.log('1', data)
      directChatHistoryHandler(socket, data)
    })

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};

module.exports = {
  registerSockerServer,
};
