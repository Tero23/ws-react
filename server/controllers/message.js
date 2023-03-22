const Message = require("../models/Message");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createMessage = catchAsync(async (req, res, next) => {
  const { author, message, room } = req.body;
  if (!author || !message || !room)
    return next(new AppError("Please fill all the required fields!"));
  const newMessage = await Message.create({
    author,
    message,
    room,
  });

  res.status(201).json(newMessage);
});

exports.getAllMessagesOfARoom = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ room: req.params.roomId });
  res.status(200).json(messages);
});
