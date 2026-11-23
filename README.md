# Shattered Realms (web prototype)

## Run locally
1. Install Node.js LTS from https://nodejs.org
2. Extract this project folder.
3. Open a terminal inside this folder.
4. Run `npm install`
5. Run `npm start`
6. Visit http://localhost:3000

Create a room (leave room-code blank) and share the code with other players. For local testing on a LAN, players can visit the host computer's local IP on port 3000. Public internet play requires deploying to a host that supports Node.js and WebSockets, such as Render or Railway. Set the service start command to `npm start`; use the generated HTTPS URL. No AI API or database is included yet; NPC AI, persistence, richer character customization and combat are future modules.
