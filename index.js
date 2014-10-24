var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbMod = require('./db.js');
var ObjectID = require('mongodb').ObjectID;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/messages/:id', function(req, res){
  var chatroom_id = req.params.id;
  dbMod.getMsgs({ room_id: chatroom_id }, function(err, messages) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(messages);   
  });
});

app.get('/chatrooms', function(req, res){
  dbMod.getChatrooms({}, function(err, chatrooms) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(chatrooms);  
  });
});

app.get('/chatroom/:id', function(req, res){
  var chatroom_id = req.params.id;
  dbMod.getChatroom({ "_id": new ObjectID(chatroom_id)}, function(err, chatroom) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(chatroom);  
  });
});

io.on('connection', function(socket){
    
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    dbMod.saveMsg({ message: msg.message, user_id: msg.user_id, room_id: msg.room_id,  created_date: new Date().getTime() });
  });
  
  socket.on('chat room', function(chatroom){
    dbMod.saveChatroom({ name: chatroom.name, username: chatroom.username, user_id: chatroom.user_id,  created_date: new Date().getTime() }, function(err, newchatroom) {
      if(err){
        console.log('error newchatroom');    
      }else{
        io.emit('chat room', newchatroom);
      }
    });
  });
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});