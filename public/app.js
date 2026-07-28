let socket = io();

let currentRoom = null;
let selectedColour = null;

window.onload = function(){
  document.querySelectorAll("#colourPalette button").forEach(s => s.style.backgroundColor = s.dataset.hex)
}

// Updates screen once confirmed room is created
socket.on("room-created", (data) => {
  currentRoom = {code: data.code, playerID: data.playerID}; // used to identify which room player is in
  addPlayerUI(data.name);
  showScreen("screen-chips");
})

// Updates screen once chip has been confirmed
socket.on("chip-add-result", (data) => { // data contains: success, colour, value (if successfull)
  if(data.success === false){
    return alert(data.error);
  }
  else if(data.success === true){
    let chipList = document.getElementById("chipList"); 
    let newDiv = document.createElement("div"); // creating a div for the new chip

    let button = document.querySelector(`button[data-colour="${data.colour}"]`); // finds button with data.colour value
    let colourCircle = document.createElement("span");
    colourCircle.style.backgroundColor = button.dataset.hex;
    newDiv.appendChild(colourCircle); // adding a circle representing colour

    let colourName = document.createElement("span");
    colourName.textContent = data.colour;
    newDiv.appendChild(colourName); // adding name of the colour

    let price = document.createElement("span");
    price.textContent = data.value;
    newDiv.appendChild(price); // adding value of the chip

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";
    deleteButton.onclick = function(){ // this needs to be fixed
      delete currentRoom.chipValues[chipColour];
      newDiv.remove();
    }
    newDiv.appendChild(deleteButton); // adding button to delete this chip config

    chipList.appendChild(newDiv);
  }
})

// Switch between screens
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Called when host clicks "Create →"
function createRoom() {
  const name = document.getElementById('host-name').value.trim();
  if (!name) return alert('Please enter your name');

  // emits the data to the server to create the room
  socket.emit("create-room", name);
  document.getElementById("create-room-button").disabled = true;
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

  //client side testing
  if(selectedColour){ // checks whether a colour has been selected
    chipColour = selectedColour.name;
  }else{
    return alert("Please select a colour");
  }

  if(chipValue < 1 || !Number.isInteger(chipValue)){
    return alert("Chip value is invalid. Should be at least 1 and an integer");
  }

  socket.emit("add-chip", {value: chipValue, colour: chipColour, code: currentRoom.code});

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

