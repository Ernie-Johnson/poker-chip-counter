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

    })

    socket.on("create-room", (name) =>{
        let room = new Room();
        let player = room.addPlayer(name);
        rooms.push(room);
        
        socket.emit("room-created", {code: room.roomCode, playerID: player.ID, name: player.name});
    })
});
app.use(express.static("public"));
server.listen(3000);

