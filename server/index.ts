import express from "express";
import { createServer } from "http";
import socketIO from "socket.io";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = express();
const server = createServer(app);
const io = socketIO(server);
const nextApp = next({ dev });
const nextRequestDefaultHandler = nextApp.getRequestHandler();

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 };
    const numberOfClients = roomClients.length;

    // These events are emitted only to the sender socket.
    if (numberOfClients == 0) {
      console.log(
        `Creating room ${roomId} and emitting room_created socket event`
      );
      socket.join(roomId);
      socket.emit("room_created", roomId);
    } else if (numberOfClients == 1) {
      console.log(
        `Joining room ${roomId} and emitting room_joined socket event`
      );
      socket.join(roomId);
      socket.emit("room_joined", roomId);
    } else {
      console.log(`Can't join room ${roomId}, emitting full_room socket event`);
      socket.emit("full_room", roomId);
    }
  });

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on("start_call", (roomId) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`);
    socket.broadcast.to(roomId).emit("start_call");
  });
  socket.on("penco", () => {
    console.log(`pencazo`);
  });
  socket.on("webrtc_offer", (event) => {
    console.log(
      `Broadcasting webrtc_offer event to peers in room ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_offer", event.sdp);
  });
  socket.on("webrtc_answer", (event) => {
    console.log(
      `Broadcasting webrtc_answer event to peers in room ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_answer", event.sdp);
  });
  socket.on("webrtc_ice_candidate", (event) => {
    console.log(
      `Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_ice_candidate", event);
  });
});

nextApp.prepare().then(() => {
  app.get("*", (req, res) => nextRequestDefaultHandler(req, res));

  server.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
