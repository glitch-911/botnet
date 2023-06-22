const net = require("net");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Keep track of the chat clients
const clients = [];
let clientCount = 0;

const port = 5000;

const prefix = "!";

// Start a TCP Server
net
  .createServer((socket) => {
    // Identify this client
    socket.name = `${socket.remoteAddress}:${socket.remotePort}`;

    // Put this new client in the list
    clients.push(socket);

    // Send a nice welcome message and announce
    clientCount++;
    broadcast(
      `User ${socket.name} has connected. User count is ${clientCount}.\n`
    );

    prompt();

    function userDisconnected() {
			// Remove the client from the list when it leaves
      clients.splice(clients.indexOf(socket), 1);
      clientCount--;
      broadcast(
        `User ${socket.name} has disconnected. User count is ${clientCount}.\n`
      );
      if (clientCount < 1) console.log("Waiting for clients to connect.\n");
    }

    // Send a message to all clients
    function broadcast(message) {
      clients.forEach((client) => {
        client.write(message);
      });
      // Log it to the server output too
      process.stdout.write(message.replace(">>", ""));
    }

    function prompt() {
      readline.question(">> ", (msg) => {
        broadcast(`Server: ${msg}`);
        // readline.close();
        return prompt();
      });
    }
    socket.on("end", () => {
      userDisconnected();
    });
    socket.on("error", () => {
      userDisconnected();
    });
  })
  .listen(port);

console.log(`Chat server running at port ${port}.`);
console.log(`Waiting for connections.\n`);
