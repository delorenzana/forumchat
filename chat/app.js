var express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  dbMod = require('./db.js'),
  app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/init', function(req, res){
  dbMod.initUser(req.body, function(err, user) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(user);
  }); 
});

app.post('/user', function(req, res){
  dbMod.updateUser(req.body, function(err, user) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(user);
  });
});

app.get('/online_users/:online_seconds', function(req, res){
  var online_seconds = req.params.online_seconds;
  var now = new Date().getTime();
  dbMod.getOnlineUsers({ last_online: { $gt: (now-online_seconds*1000) }, available: 1 }, function(err, users) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(users);  
  });
});

app.get('/chatrooms', function(req, res){
  dbMod.getChatrooms({}, function(err, chatrooms) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(chatrooms);  
  });
});

app.get('/private_chat/:user_id/:with_user_id', function(req, res){
  var user_id = req.params.user_id;
  var with_user_id = req.params.with_user_id;
  dbMod.savePrivateChat({ user_id: user_id, with_user_id: with_user_id }, function(err, privatechat) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(privatechat);  
  });
});

app.get('/private_msgs/:private_chat_id', function(req, res){
  var private_chat_id = req.params.private_chat_id;
  dbMod.getPrivateMsgs({ private_chat_id: private_chat_id }, function(err, msgs) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(msgs);  
  });
});

app.get('/chatroom_msgs/:chatroom_id', function(req, res){
  var chatroom_id = req.params.chatroom_id;
  dbMod.getChatroomMsgs({ chatroom_id: chatroom_id }, function(err, msgs) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(msgs);  
  });
});

app.post('/private_msg', function(req, res){
  dbMod.savePrivateMsg(req.body, function(err, msg) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(msg);
  });
});

app.post('/chatroom_msg', function(req, res){
  dbMod.saveChatroomMsg(req.body, function(err, msg) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(msg);
  });
});

app.post('/chatroom', function(req, res){
  dbMod.saveChatroom(req.body, function(err, chatroom) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if(err){
      res.send(null);
    }else{
      res.send(chatroom);  
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

module.exports = app;
