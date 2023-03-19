// modules
const express = require("express")
const socketio = require("socket.io")
const http = require("http")
const app = express()

// function
const { userJoin, getRoomUsers, getCurrentUser, userLeave } = require("./utils/users")
const formateMessage = require("./utils/messages")

//server connection 
const server = http.createServer(app)
const io = socketio(server)


const boatName = "Masai Server";

io.on("connection", (socket) => {

    console.log("one client joined")

    socket.on("joinRoom", ({ username, room }) => {


        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

        // Welcome current 
        socket.emit("message", formateMessage(boatName, "Welcome to Masai Server"))

        // broadcat to other users
        socket.broadcast.to(user.room).emit("message", formateMessage(boatName, `${user.username} has joined the chat`))

        //  Get all room user
        io.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })

    })


    socket.on("chatMessage",(msg)=>{
          const user = getCurrentUser(socket.id)
          io.to(user.room).emit("message",formateMessage(user.username,msg))
    });


    socket.on("disconnect",()=>{
        
        const user = userLeave(socket.id)

        io.to(user.room).emit("message",formateMessage(boatName,`${user.username} has left the chat`))

          //  Get all room user
          io.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })

    })

});





const PORT = 8080
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
