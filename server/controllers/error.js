require("dotenv").config();
const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid Id!`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.email}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.message.startsWith("No such token")) {
    res.status(400).json({
      message: "Wrong Credentials!",
    });
  }
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't send error details to the client
  } else {
    console.log(err.message);
    res.status(500).json({
      status: "error",
      message: "Something went really wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    console.log(err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    console.log(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.kind === "ObjectId") error = handleCastErrorDB(error);
    if (error.message.split(" ")[1] === "validation")
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
