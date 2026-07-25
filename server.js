const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { Socket } = require("dgram");

let app = express();
let server = http.createServer(app);

let io = new Server(server);
io.on("connection", (socket) => {
    console.log("Someone connected!");
});
app.use(express.static("public"));
server.listen(3000);

