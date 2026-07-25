let rooms = [];
let currentRoom = null;
let selectedColour = null;

window.onload = function(){
  document.querySelectorAll("#colourPalette button").forEach(s => s.style.backgroundColor = s.dataset.hex)
}

// Switch between screens
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Called when host clicks "Create →"
function createRoom() {
  const name = document.getElementById('host-name').value.trim();
  if (!name) return alert('Please enter your name');

  // creates the room once it has received a name
  let room = new Room();
  room.addPlayer(name);
  addPlayerUI(name); // adds player to the list on room-lobby screen
  rooms.push(room);
  currentRoom = room;

  showScreen("screen-chips");
}

function selectColour(button){
  if(selectedColour){
    document.querySelector("#colourPalette button.selected").classList.remove("selected");
  }
  button.classList.add("selected");
  selectedColour = {name: button.dataset.colour, hexcode: button.dataset.hex};
}

function addChip(){
  let chipValue = Number(document.getElementById("chipValue").value);
  let chipColour = null;

  if(selectedColour){ // checks whether a colour has been selected
    chipColour = selectedColour.name;
  }else{
    return alert("Please select a colour");
  }

  if(currentRoom.chipValues.hasOwnProperty(selectedColour.name)){ // checks whether colour has already been used
    return alert("This colour chip already exists");
  }

  if(chipValue < 1 || !Number.isInteger(chipValue)){
    return alert("Chip value is invalid. Should be at least 1 and an integer");
  }
  
  currentRoom.chipValues[chipColour] = chipValue;

  let chipList = document.getElementById("chipList"); 
  let newDiv = document.createElement("div"); // creating a div for the new chip

  let colourCircle = document.createElement("span");
  colourCircle.style.backgroundColor = selectedColour.hexcode;
  newDiv.appendChild(colourCircle); // adding a circle representing colour

  let colourName = document.createElement("span");
  colourName.textContent = selectedColour.name;
  newDiv.appendChild(colourName); // adding name of the colour

  let price = document.createElement("span");
  price.textContent = chipValue;
  newDiv.appendChild(price); // adding value of the chip

  let deleteButton = document.createElement("button");
  deleteButton.textContent = "✕";
  deleteButton.onclick = function(){
    delete currentRoom.chipValues[chipColour];
    newDiv.remove();
  }
  newDiv.appendChild(deleteButton); // adding button to delete this chip config

  chipList.appendChild(newDiv);

  // resetting selected colour and chip value
  selectedColour = null;
  document.getElementById("chipValue").value = "";
}

function confirmChips(){
  // needs to validate that conditions are met
  if(Object.keys(currentRoom.chipValues).length == 0){
    return alert("No chips created");
  }
  showScreen("screen-lobby");
  document.getElementById("roomCodeDisplay").textContent = currentRoom.roomCode;

}

function addPlayerUI(name){
  let playerList = document.getElementById("playerList");
  let newPlayer = document.createElement("span");
  newPlayer.textContent = name;
  playerList.appendChild(newPlayer);
}

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
  }
  setChipValues(values){ // should be an object as the parameter
    this.chipValues = values;
  }
}