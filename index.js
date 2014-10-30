var express = require('express');
var app = express();
var connection  = require('express-myconnection'); 
//var mysql = require('mysql');
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbMod = require('./db.js');
//var userMod = require('./users.js');
var ObjectID = require('mongodb').ObjectID;
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

//app.use(
//    connection(mysql,{
//        host: 'localhost',
//        user: 'xenforo',
//        password : 'xenforo',
//        port : 3306, 
//        database:'xenforo'
//    },'pool')
//);

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

app.get('/userchat/:id', function(req, res){
  var chatroom_id = req.params.id;
  dbMod.getChatroom({ "_id": new ObjectID(chatroom_id)}, function(err, chatroom) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(chatroom);  
  });
});

//app.get('/online_users', function(req, res){
//  userMod.getOnlineUsers('SELECT * FROM xf_user AS user JOIN xf_session_activity AS activity ON (user.user_id = activity.user_id) WHERE activity.view_date > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 300 SECOND))', req, function(err, users) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    res.send(users);  
//  });
//});

app.get('/online_users/:online_seconds', function(req, res){
  var online_seconds = req.params.online_seconds;
  var now = new Date().getTime();
  dbMod.getOnlineUsers({ last_online: { $gt: (now-online_seconds*1000) } }, function(err, users) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(users);  
  });
});

app.post('/user', function(req, res){
  var user_id = parseInt(req.body.user_id);
  var username = req.body.username;
  var is_moderator = parseInt(req.body.is_moderator);
  var avatar = req.body.avatar;
//  var user_id = 1;
//  var username = 'admin';
//  var is_moderator = 1;
//  var avatar = 'data/avatars/s/0/1.jpg';
  dbMod.saveUser({ user_id: user_id, username: username, is_moderator: is_moderator, avatar: avatar, last_online: new Date().getTime() }, function(err, user) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(user);
  });
});

app.get('/userchatmsgs/:id', function(req, res){
  var userchat_id = req.params.id;
  dbMod.getPrivateMsgs({ private_chat_id: userchat_id }, function(err, messages) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(messages);   
  });
});

io.on('connection', function(socket){
    
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    dbMod.saveMsg({ message: msg.message, user_id: msg.user_id, username: msg.username, room_id: msg.room_id,  created_date: new Date().getTime() });
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
  
  socket.on('start user chat', function(userchat){
    dbMod.savePrivateChat({ user_id: userchat.user_id, with_user_id: userchat.with_user_id,  created_date: new Date().getTime() }, function(err, newuserchat) {
      if(err){
        console.log('error start user chat');    
      }else{
        io.emit('start user chat', newuserchat);
      }
    });
  });
  
  socket.on('userchat message', function(msg){
    io.emit('userchat message', msg);
    dbMod.savePrivateMsg({ private_chat_id: msg.private_chat_id, message: msg.message, user_id: msg.user_id, username: msg.username, with_user_id: msg.with_user_id,  created_date: new Date().getTime() });
  });
  
  socket.on('user login', function(user){
    io.emit('user login', user);
  });
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});