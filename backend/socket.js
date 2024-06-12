const { Server } = require("socket.io");

let io;

exports.socketIo = {
  init: server => {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", socket => {
      console.log("client connected ", socket.id);
    });
    server.listen(8080);
  },
  getIO: () => {
    if (!io) {
      throw Error("No socket found");
    }
    return io;
  },
};
