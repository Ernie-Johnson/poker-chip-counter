let socket = io();

let currentRoom = null;
let selectedColour = null;

window.onload = function(){
  document.querySelectorAll("#colourPalette button").forEach(s => s.style.backgroundColor = s.dataset.hex)
}

// Updates screen once confirmed room is created
socket.on("room-created", (data) => {
  currentRoom = {code: data.code, playerID: data.player.ID, colours: data.colours, total: {}}; // used to identify which room player is in
  let total = currentRoom.total[data.player.ID] ?? 0;
  addPlayerUI(data.player, total);
  showScreen("screen-chips");
})

// Updates screen once chip has been confirmed
socket.on("chip-add-result", (data) => { // data contains: success, colour, value (if successful)
  if(data.success === false){
    return alert(data.error);
  }
  else if(data.success === true){
    let chipList = document.getElementById("chipList"); 
    let newDiv = document.createElement("div"); // creating a div for the new chip

    let button = document.querySelector(`button[data-colour="${data.colour}"]`); // finds button with data.colour value
    let colourCircle = document.createElement("span");
    if(button){
      colourCircle.style.backgroundColor = button.dataset.hex;
    }else{
      colourCircle.style.backgroundColor = "#808080";
    }
    
    newDiv.appendChild(colourCircle); // adding a circle representing colour

    let colourName = document.createElement("span");
    colourName.textContent = data.colour;
    newDiv.appendChild(colourName); // adding name of the colour

    let price = document.createElement("span");
    price.textContent = data.value;
    newDiv.appendChild(price); // adding value of the chip

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";
    deleteButton.onclick = function(){ // removes chip config from screen when X pressed
      socket.emit("remove-chip", {colour: data.colour, code: currentRoom.code});
      newDiv.remove();
    }
    newDiv.appendChild(deleteButton); // adding button to delete this chip config

    chipList.appendChild(newDiv);
  }
})

socket.on("chip-confirm-result", (data) => {
  if(data.success === false){
    return alert(data.error);
  }
  else if(data.success === true){
    showScreen("screen-lobby");
    document.getElementById("roomCodeDisplay").textContent = currentRoom.code;
  }
})

socket.on("join-room-result", (data) => {
  if(data.success === false){
    document.getElementById("join-room-button").disabled = false;
    return alert(data.error);
  }
  else if(data.success === true){
    currentRoom = {code: data.code, playerID: data.player.ID, colours: data.colours, total: data.total};
    showScreen("screen-lobby");
    document.getElementById("roomCodeDisplay").textContent = currentRoom.code;
  }

})

socket.on("player-joined", (data) => {
  renderPlayerList(data.players);
})

socket.on("chip-count-result", (data) => {
  document.getElementById("chip-entry-overlay").classList.remove("hidden");

  let chipEntry = document.getElementById("chip-entry-box");
  chipEntry.replaceChildren();

  for(let colour of data.colours){
    let newDiv = document.createElement("div");

    let chipColour = document.createElement("label");
    chipColour.textContent = colour;
    newDiv.appendChild(chipColour);

    let chipCounter = document.createElement("input");
    chipCounter.value = data.chipCount[colour];
    chipCounter.dataset.colour = colour;
    chipCounter.type = "number";
    newDiv.appendChild(chipCounter);

    chipEntry.appendChild(newDiv);
  }
})

socket.on("chip-save-result", (data) => {
  if(data.success === false){
    return alert(data.error);
  }
})

socket.on("new-total", (data) => {
  currentRoom.total = data.total;
  renderPlayerList(data.players);
  let roomTotal = Object.values(currentRoom.total).reduce((accumulator, current) => accumulator + current, 0);
  document.getElementById("roomTotalDisplay").textContent = formatPence(roomTotal);
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
  let highlighted = document.querySelector("#colourPalette button.selected");

  selectedColour = null;
  document.getElementById("chipValue").value = "";
  if(highlighted) highlighted.classList.remove("selected");
}

function confirmChips(){
  socket.emit("confirm-chip", {code: currentRoom.code});
}

function addPlayerUI(player, total){
  let playerList = document.getElementById("playerList");
  let newDiv = document.createElement("div");

  let nameSpan = document.createElement("span");
  nameSpan.textContent = player.name;
  newDiv.appendChild(nameSpan);

  let totalSpan = document.createElement("span");
  totalSpan.textContent = formatPence(total);
  newDiv.appendChild(totalSpan);
  
  playerList.appendChild(newDiv);
}

function joinRoom(){
  let joinCode = document.getElementById("room-code").value.toUpperCase();
  let playerName = document.getElementById("player-name").value;

  if(joinCode === "" || joinCode.length != 6){
    return alert("Room code is invalid");
  }
  if(playerName.length === 0){
    return alert("Enter a name");
  }

  socket.emit("join-room", {name: playerName, code: joinCode});
  document.getElementById("join-room-button").disabled = true;
}

function renderPlayerList(players){
  let playerList = document.getElementById("playerList");
  playerList.replaceChildren();

  for (let player of players){
    let playerTotal = currentRoom.total[player.ID] ?? 0;
    addPlayerUI(player, playerTotal);
  } 
}

function openChipEntry(){
  socket.emit("get-chip-count", {code: currentRoom.code})
}

function saveChipEntry(){
  let chips = {};
  document.querySelectorAll("#chip-entry-box input").forEach(s => chips[s.dataset.colour] = Number(s.value));
  socket.emit("chip-save", {code: currentRoom.code, chips: chips});
  document.getElementById("chip-entry-overlay").classList.add("hidden");
}

function formatPence(pence) {
  if (pence < 100) {
    return `${pence}p`;
  }
  return `£${(pence / 100).toFixed(2)}`;
}