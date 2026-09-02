# Chip Counter
A real-time multiplayer web app for splitting up the poker pot at the end of the game. The host creates a room, sets the value of each chip colour, and then players join using the room code and enter their chip stack. Totals update live for everyone in the room.

I built this after one too many poker nights where the chip totals never quite added up at the end. Rather than manually counting and recounting stacks, this lets everyone enter their own chips, with the maths handled automatically and totals visible to the whole table in real time.

## Features
- Room creation and joining via a 6-letter code
- Custom chip configuration by allowing the host to select a colour and assign a value to said colour
- Live multiplayer sync
- Manual chip-count entry (prefilled with the player's last submitted value)
- Live leaderboard

## Tech stack
- Backend: Node.js, Express, Socket.io
- Frontend: Vanilla HTML/CSS/JavaScript

## Architecture
The app uses a strict client-server split:
- Client: reads user input, does lightweight format validation and emits requests to the server. It never mutates shared game state directly.
- Server: holds every Room and each room's players and chip configuration. Validates each incoming request, mutates state, and responds.

Two response patterns are used throughout, matching Socket.io's private vs. group messaging:
- Private response (socket.emit) — sent back to just the one client that made a request, e.g. confirming a room was created and returning its code.
- Broadcast (io.to(roomCode).emit) — sent to every client in a room via Socket.io's built-in room grouping, e.g. notifying everyone when a player joins, leaves, or updates their chip count.

## What I would like to add next
Camera capture which enables users to take a photo of their chips from their phones and have an AI vision integration to automatically calculate their total from the photo.
