const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  author: {
    type: String,
    trim: true,
    required: [true, "Please provide an author!"],
  },
  message: {
    type: String,
    required: [true, "Please provide a message!"],
  },
  room: {
    type: String,
    required: [true, "Please provide a room!"],
  },
  time: {
    type: String,
    default:
      new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
