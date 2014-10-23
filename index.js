var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbMod = require('./db.js');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:chatroom', function(req, res, next){
  var chatroom = req.params.chatroom;
  dbMod.getMsgs({ room: chatroom }, function(err, messages) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(messages);   
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    dbMod.saveMsg({ message: msg.message, room: msg.room,  created_date: new Date().getTime() });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});