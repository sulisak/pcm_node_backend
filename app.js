const express = require("express");
const app = express();
const connection = require("./conn");
require('dotenv').config()

const http = require("http").createServer(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let users = [];

socketIO.on("connection", function (socket) {
  socket.on("connected", function (userId) {
    users[userId] = socket.id;
  });

  // connect DB
  socket.on("sendEvent", async function (data) {
    console.log(users);
    connection.query(
      `SELECT * FROM users WHERE userid =${data.userId}`,
      function (err, receiver) {
        if (receiver != null) {
          if (receiver.length > 0) {
            connection.query(
              `SELECT * FROM users WHERE userid = ${data.myId}`,
              (error, result) => {
                if (result.length > 0) {
                  var message =
                    "message from: " +
                    result[0].fullname +
                    " Message: " +
                    data.message;
                  socketIO
                    .to(users[receiver[0].userid])
                    .emit("messageReceipted", message);
                }
              }
            );
          }
        }
      }
    );
  });
});

http.listen(process.env.PORT, () => {
  console.log("listening on port 3000");
});
