var allowed_origin = "http://xenforo.localhost", 
    cookie_name = "frdmchat_token",
    express = require('express'),
    path = require('path'),
    fs = require('fs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    dbObjects = require('./objects.js'),
    chatUsers = new dbObjects.ChatUsers(),
    app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", allowed_origin);
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


app.post('/init', function(req, res) {
    chatUsers.initUser(req.body, function(err, user) {
        if (err) {
            res.send(null);
        } else {
            res.cookie(cookie_name, user.token);
            res.send(user);
        }
    }); 
});

app.get('/chat/:user_id/:token', function(req, res) {
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if (verified_token) {
        res.sendFile(__dirname + '/public/templates/chat.html');
    } else {
        res.send(null);
    }
});

app.post('/update', function(req, res) {
    chatUsers.updateUser(req.body, function(err, user) {
        if (err) {
            res.send(null);
        } else {
            res.send(user);
        }
    });
});

app.get('/online_users/:user_id/:token', function(req, res) {
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.getOnlineUsers(function(err, users) {
            if (err) {
                res.send(null);
            } else {
                res.send(users);
            }
        });
    }else{
        res.send(null);
    }
});

app.get('/chatrooms/:user_id/:token', function(req, res) {
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.getChatrooms(function(chatrooms) {
            res.send(chatrooms);
        });  
    }else{
        res.send(null);
    }
});

app.get('/private_chat/:user_id/:with_user_id/:token', function(req, res) {
    var user_id = req.params.user_id;
    var with_user_id = req.params.with_user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.initPrivateChat({ user_id: user_id, with_user_id: with_user_id, token: token }, function(err, privatechat) {
            if (err) {
                res.send(null);
            } else {
                res.send(privatechat);
            }  
        });
    } else {
        res.send(null);
    }
});

app.get('/private_chats/open/:user_id/:token', function(req, res) {
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.getOpenPrivateChats(user_id, function(err, private_chats) {
            if(err){
                res.send(null);
            }else{
                res.send(private_chats);
            }
        });  
    }else{
        res.send(null);
    }
});

app.post('/private_chat/close', function(req, res) {
    chatUsers.closePrivateChat(req.body, function(err, privatechat) {
        if (err) {
            res.send(null);
        } else {
            res.send(privatechat);
        }  
    });
});

app.get('/private_msgs/:private_chat_id/:user_id/:token', function(req, res) {
    var private_chat_id = req.params.private_chat_id;
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.getPrivateMessages({ private_chat_id: private_chat_id, token: token } , function(err, msgs) {
            if (err) {
                res.send(null);
            } else {
                res.send(msgs);
            }  
        });
    } else {
        res.send(null);
    }
});

app.get('/chatroom_msgs/:chatroom_id/:user_id/:token', function(req, res) {
    var chatroom_id = req.params.chatroom_id;
    var user_id = req.params.user_id;
    var token = req.params.token;
    var verified_token = chatUsers.verifyToken(user_id, token);
    if(verified_token){
        chatUsers.getChatroomMessages(chatroom_id, function(err, msgs) {
            if (err) {
                res.send(null);
            } else {
                res.send(msgs);
            }  
        });
    }else{
        res.send(null);
    }
});

app.post('/private_msg', function(req, res) {
    chatUsers.addPrivateMessage(req.body, function(err, msg) {
        if (err) {
            res.send(null);
        } else {
            res.send(msg);
        }  
    });
});

app.post('/chatroom_msg', function(req, res) {
    chatUsers.addChatroomMessage(req.body, function(err, msg) {
        if (err) {
            res.send(null);
        } else {
            res.send(msg);
        }  
    });
});

app.post('/chatroom', function(req, res) {
    chatUsers.addChatroom(req.body, function(err, chatroom) {
        if (err) {
            res.send(null);
        } else {
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
