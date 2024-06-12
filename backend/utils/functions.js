const fs = require("fs");
const path = require("path");

exports.createErrorObj = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode || 500;
  return {
    error: true,
    message: error.message,
    statusCode: error.statusCode,
  };
};

exports.createSuccessObj = (data, message = "Sucesssful", statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

exports.createPagiantedSuccessObj = (data, metaData, message = "Sucesssful", statusCode = 200) => {
  let n = {
    prevPageUrl: true,
    nextPageUrl: true,
    totalPages: 3,
    totalItems: 23,
  };
  return {
    success: true,
    message,
    data,
    statusCode,
    metaData,
  };
};

exports.deleteFile = filePath => {
  fs.unlink(path.join(filePath), err => console.log(err));
};
