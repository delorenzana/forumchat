var express = require('express');
var app = express();
var path = require('path');
var jade = require('jade');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbMod = require('./db.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

function saveMsg(msg){
    dbMod.startDb();
    db.open(function(err, db) {
    var collection = db.collection("messages");
      collection.insert(msg);
  });
}

function getMsgs(query, callback){
    dbMod.startDb();
    db.open(function(err, db) {
    var collection = db.collection("messages");
    
    collection.find(query).toArray(function(err, messages) {
       if(!messages || err){
        callback(true);
       }else{
        callback(false, messages);   
       }
        // Let's close the db
        db.close();
      });
    
  });
}

app.get('/:chatroom', function(req, res){
  var chatroom = req.params.chatroom;
  getMsgs({ room: chatroom }, function(err, messages) {
       var theMessages = [];
       for(i in messages){
           theMessages.push("{ message: '"+messages[i].message+"', room: '"+messages[i].room+"' }");
       }
       res.render('index', {
         title: chatroom,
         messages: "["+theMessages+"]"
       }, function(err, html){
            res.end(html);
       });
       
  });
});

//app.get('/:chatroom', function(req, res){
//  var chatroom = req.params.chatroom;
//  getMsgs({ room: chatroom }, function(err, messages) {
//       var theMessages = [];
//       for(i in messages){
//           theMessages.push("{ message: '"+messages[i].message+"', room: '"+messages[i].room+"' }");
//       }
//       res.render('chat', {
//         title: chatroom,
//         messages: "["+theMessages+"]"
//       }, function(err, script){
//            res.end(script);
//       });
//       
//  });
//});

io.on('connection', function(socket){
  //console.log('a user connected');
//  socket.on('disconnect', function(){
//    console.log('user disconnected');
//  });
  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    io.emit('chat message', msg);
    
    saveMsg({ message: msg.message, room: msg.room,  created_date: new Date().getTime() });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});