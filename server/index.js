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



const corsOptions = {
    origin: 'https://chat-app-psi-flame.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  };
  
app.use(cors(corsOptions));
  

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://chat-app-psi-flame.vercel.app",
        methods: ["GET", "POST"],
    },
});

app.get("/", (req, res) => { res.json ("Hello"); })

let connectedUsers = 0;
const maxUsers = 4; // Set the maximum number of users

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

server.listen(5000, () => console.log("Server running at port 5000"));