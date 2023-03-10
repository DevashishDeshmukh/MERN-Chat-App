const express=require("express");
const connectDB = require("./config/db");
const {chats} = require("./data/data");
require('dotenv').config()


const app =express();
connectDB();

//USE POSTMAN FOR TESTING THE APIS 
//Just to check if api is working 
app.get('/', (req,res)=>{
    res.send("API is working");
});

//sends all chats at once in  form of javascript object 
app.get('/api/chat', (req, res)=>{
    res.send(chats);
});


//sends a chats whose ID is given form of javascript object 
app.get('/api/chat/:id', (req, res)=>{
    // console.log(req.params.id);
    const singleChat = chats.find((c)=> c._id === req.params.id);
    res.send(singleChat);
});

const PORT =process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on port ${PORT}`));