const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mychat-b309a-default-rtdb.firebaseio.com",
});

const PORT = process.env.PORT || 5000;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});



let connectedUsers = 0;
const maxUsers = 144; // Set the maximum number of users
io.on("connection", (socket) => {
    const transport = socket.conn.transport.name; // in most cases, "polling"
  
    socket.conn.on("upgrade", () => {
      const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
    });
  });
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  if (connectedUsers < maxUsers) {
    connectedUsers++;
    io.emit("user-joined", `User ${connectedUsers} has joined.`);
  } else {
    // Send a message to the client that the limit is reached
    socket.emit("limit-reached", "Chat room is full. The limit is 4 users.");
    socket.disconnect();
  }

  socket.on("send-message", (message) => {
    console.log(message);
    const messagesRef = admin.database().ref("messages");
    const newMessageRef = messagesRef.push();
    newMessageRef.set({
      user: message.user,
      message: message.message,
      time: message.time,
    });

    io.emit("received-message", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedUsers--;
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello, Yash</h1>");
});

server.listen(PORT, () => {
  console.log(`🎯 Server is running on PORT: ${PORT}`);
});
