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
  calculateTotal(){
    let total = {}
    for(let player of this.players){
      let sum = 0;
      if(!player.chipCount){
        total[player.ID] = 0;
      }
      else{
        for(let colour of Object.keys(player.chipCount)){
          sum += player.chipCount[colour] * this.chipValues[colour];
        }
        total[player.ID] = sum;
      }
    }
    return total;
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
      socket.emit("join-room-result", {success: true, player: player, code: room.roomCode, players: room.players, colours: Object.keys(room.chipValues), total: room.calculateTotal()});
      socket.join(room.roomCode);
      io.to(room.roomCode).emit("player-joined", { players: room.players });
      socket.roomCode = room.roomCode;
      socket.playerID = player.ID;
    })

    socket.on("create-room", (name) =>{ 
      let room = new Room();
      let player = room.addPlayer(name);
      rooms.push(room);
      
      socket.emit("room-created", {code: room.roomCode, player: player, colours: Object.keys(room.chipValues)});
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

      if(room.players.length === 0){
        rooms = rooms.filter(r => r.roomCode !== room.roomCode)
      }
    })

    socket.on("get-chip-count", (data) => {
      let room = rooms.find(r => r.roomCode === data.code);
      if(!room) return;

      let player = room.players.find(r => r.ID === socket.playerID);
      if(!player) return;

      if(!player.chipCount){
        player.chipCount = {};
        for(let colour of Object.keys(room.chipValues)){
          player.chipCount[colour] = 0;
        }
      }

      socket.emit("chip-count-result", {chipCount: player.chipCount, colours: Object.keys(room.chipValues)});
    })

    socket.on("chip-save", (data) => {
      let room = rooms.find(r => r.roomCode === data.code);
      if(!room) return;

      let player = room.players.find(r => r.ID === socket.playerID);
      if(!player) return;

      let valid = Object.values(data.chips).every(v => Number(v) >= 0 && Number.isInteger(Number(v)));
      if(!valid){
        socket.emit("chip-save-result", {success: false, error: "Chip inputs are invalid"});
        return;
      } 

      if(!player.chipCount){
        player.chipCount = {};
      } 

      for(let colour of Object.keys(data.chips)){
        player.chipCount[colour] = Number(data.chips[colour])
      }

      let total = room.calculateTotal();
      io.to(room.roomCode).emit("new-total", {total: total, players: room.players});
    })
  
});
app.use(express.static("public"));
server.listen(3000);

