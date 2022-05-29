const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
  
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

const server = http.createServer(app)
const io = socketIO(server, {
 cors: {
   origin: "http://localhost:3000",
 },
});


var messages=[]
const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
 // Get nickname and channel.
 const { idstream, iduser } = socket.handshake.query;
 console.log(`someoneconnected`);
 // Join the user to the channel.
 socket.join(idstream);


 // Handle disconnect
 socket.on("disconnect", () => {
    console.log(`user disconnected`);
    
  });
 

 
socket.on("MESSAGE_SEND", (data) => {

    messages.push(data)
    socket.broadcast.emit("NEW_MESSAGE", data);
    console.log(messages)
 });
})
 
 app.get("/streams/messages", (req, res) => {
  const allMessages = messages
 
  return res.json({ allMessages });
 });
 


server.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
