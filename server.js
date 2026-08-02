const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const { Socket } = require("dgram");

let app = express();
let server = http.createServer(app);

let rooms = [];

class Room{
  constructor(){  
    this.players = []; // used to store all the players in the room
    this.chipValues = {}; // used to store the values of each chip
    this.roomCode = this.generateCode();
    this.IdIndex = 0; // used to index the IDs of the players as they join
    this.hostId = null; // used to store ID of the host of the room
  }
  generateCode(){
    let result = "";
    for(let i=0; i<6; i++){
      result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    }
    return result;
  }
  addPlayer(playerName){
    let player = {name: playerName, ID: this.IdIndex, chipCount: null};

    if(this.players.length == 0){
      this.hostId = this.IdIndex;
    }

    this.players.push(player);
    this.IdIndex++;

    return player;
  }
  setChipValues(values){ // should be an object as the parameter
    this.chipValues = values;
  }
}

let io = new Server(server);
io.on("connection", (socket) => {
    console.log("Someone connected!");

    socket.on("join-room", (data) => {
      let room = rooms.find(r => r.roomCode === data.code);
      if(!room) {
        socket.emit("join-room-result", {success: false, error: "Room doesn't exist"});
        return;
      }

      let player = room.addPlayer(data.name);
      socket.emit("join-room-result", {success: true, player: player, code: room.roomCode, players: room.players});
      socket.join(room.roomCode);
      io.to(room.roomCode).emit("player-joined", { players: room.players });
      socket.roomCode = room.roomCode;
      socket.playerID = player.ID;
    })

    socket.on("create-room", (name) =>{ 
      let room = new Room();
      let player = room.addPlayer(name);
      rooms.push(room);
      
      socket.emit("room-created", {code: room.roomCode, player: player});
      socket.join(room.roomCode);
      socket.roomCode = room.roomCode;
      socket.playerID = player.ID;
    })

    socket.on("add-chip", (data) => {
      let room = rooms.find(r => r.roomCode === data.code);

      if(!room){
        socket.emit("chip-add-result", {success: false, error: "Room not found"});
        return;
      }

      if(!data.colour){ // checks whether a colour has been selected
        socket.emit("chip-add-result", {success: false, error: "No colour selected"});
        return;
      }

      if(data.value < 1 || !Number.isInteger(data.value)){
        socket.emit("chip-add-result", {success: false, error: "Chip value is invalid. Should be at least 1 and an integer"});
        return;
      }

      if(room.chipValues.hasOwnProperty(data.colour)){ // checks whether colour has already been used
        socket.emit("chip-add-result", {success: false, error: "Chip colour already exists"});
        return;
      }

      room.chipValues[data.colour] = data.value;
      socket.emit("chip-add-result", {success: true, colour: data.colour, value: data.value})
    })

    socket.on("remove-chip", (data) =>{
      let room = rooms.find(r => r.roomCode === data.code);
      if(!room) return;
      if(room.chipValues.hasOwnProperty(data.colour)){ // checks whether colour actually exists
        delete room.chipValues[data.colour];
      }
    })

    socket.on("confirm-chip", (data) => {
      let room = rooms.find(r => r.roomCode === data.code);
      if(!room) return;

      if(Object.keys(room.chipValues).length == 0){ // checks whether any keys exist
        socket.emit("chip-confirm-result", {success: false, error: "No chips added"});
        return;
      }
      socket.emit("chip-confirm-result", {success: true});
    })

    socket.on("disconnect", () => {
      if(!socket.roomCode) return;
      if(!socket.playerID) return;

      let room = rooms.find(r => r.roomCode === socket.roomCode);
      if(!room) return;

      room.players = room.players.filter(r => r.ID !== socket.playerID);

      io.to(room.roomCode).emit("player-joined", { players: room.players });
    })
  
});
app.use(express.static("public"));
server.listen(3000);

