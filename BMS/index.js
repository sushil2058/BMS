const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/BLOG");

const express = require("express");
const app = express();

var http = require('http').createServer(app);
var{Server} = require('socket.io');
var io = new Server(http,{});

const isBlog = require("./middlewares/isBlog");

app.use(isBlog.isBlog);

//for admin routes
const adminRoute = require("./routes/adminRoute");
app.use('/',adminRoute);

//for user routes
const userRoute = require("./routes/userRoute");
app.use('/',userRoute);

//for blog routes
const blogRoute = require("./routes/blogRoute");
app.use('/',blogRoute);

const Post = require('./models/postModel');
const { ObjectId } = require('mongodb');

io.on("connection", function(socket){
    console.log('User Connected');

    socket.on("new_post", function(formData){
        console.log(formData);
        socket.broadcast.emit("new_post", formData);
    });

    socket.on("new_comment", function(comment){
        io.emit("new_comment",comment);

    });
    socket.on("delete_post", function(postId){
        socket.broadcast.emit("delete_post", postId);

    });

    socket.on("new_reply", function(reply){
        io.emit("new_reply",reply);

    });

    socket.on('increment_page_view', async function(post_id){
        var data = await Post.findOneAndUpdate({_id: new ObjectId(post_id)}, {
            $inc: {views:1}
        },{
            new: true,
        });
        socket.broadcast.emit("updated_views",data);
    })

});

http.listen(3000, function(){
        console.log("server is running");

       
});

// app.listen(3000, function(){
//     console.log("server is running");
// });