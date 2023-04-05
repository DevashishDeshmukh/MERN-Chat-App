const express=require("express");
const connectDB = require("./config/db");
const {chats} = require("./data/data");
require('dotenv').config()
const chatRoutes = require("./routes/chatRoutes")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app =express();
connectDB();

app.use( 
    express.urlencoded({extended:true})
);
app.use(express.json()); // to accept JSON Data

//USE POSTMAN FOR TESTING THE APIS 
//Just to check if api is working 
app.get('/', (req,res)=>{
    res.send("API is working");
});

// //sends all chats at once in  form of javascript object 
// app.get('/api/chat', (req, res)=>{
//     res.send(chats);
// });


// //sends a chats whose ID is given form of javascript object 
// app.get('/api/chat/:id', (req, res)=>{
//     // console.log(req.params.id);
//     const singleChat = chats.find((c)=> c._id === req.params.id);
//     res.send(singleChat);
// });


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);



app.use(notFound);
app.use(errorHandler);  


const PORT =process.env.PORT || 5000
const server=app.listen(PORT, console.log(`Server started on port ${PORT}`));


const io= require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000",
    }
});



io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });
  
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
