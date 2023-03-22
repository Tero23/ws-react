const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/error");
const { Server } = require("socket.io");

const messageRouter = require("./routes/message");

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/messages", messageRouter);

// If you hit a wrong route
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`${socket.id} has joined room ${data.room}`);
  });

  socket.on("send_message", (data) => {
    console.log(
      `${data.author} says ${data.message} in room: ${data.room} at time: ${data.time}`
    );
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

module.exports = server;
