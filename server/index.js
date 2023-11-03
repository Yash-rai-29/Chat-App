const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const admin = require("firebase-admin"); // Import Firebase Admin SDK

// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mychat-b309a-default-rtdb.firebaseio.com", // Replace with your Firebase Realtime Database URL
});


const PORT = process.env.PORT || 5000;

app.use(cors());


const server = http.createServer(app);
// Set up CORS for socket.io
const io = new Server(server, {
    cors: {
      origin: 'https://chat-app-psi-flame.vercel.app',
      methods: ['GET', 'POST'],
    },
  });
  

app.get("/", (req, res) => { res.json ("Hello"); })



io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    

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

server.listen(PORT, () => {
   console.log(`🎯 Server is running on PORT: ${PORT}`);
});