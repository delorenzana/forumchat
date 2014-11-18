var express = require('express'),
    path = require('path'),
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

app.post('/init', function(req, res) {
    chatUsers.initUser(req.body, function(err, user) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(user);
        }
    }); 
});

app.post('/update', function(req, res) {
    chatUsers.updateUser(req.body, function(err, user) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(user);
        }
    });
});

app.get('/online_users/:online_seconds', function(req, res) {
    var online_seconds = req.params.online_seconds;
    chatUsers.getOnlineUsers(online_seconds, function(err, users) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(users);
        }
    });
});

app.get('/chatrooms', function(req, res) {
    chatUsers.getChatrooms(function(chatrooms) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(chatrooms);
    });
});

app.get('/private_chat/:user_id/:with_user_id', function(req, res) {
    var user_id = req.params.user_id;
    var with_user_id = req.params.with_user_id;
    chatUsers.initPrivateChat({ user_id: user_id, with_user_id: with_user_id }, function(err, privatechat) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(privatechat);
        }  
    });
});

app.get('/private_msgs/:private_chat_id', function(req, res) {
    var private_chat_id = req.params.private_chat_id;
    chatUsers.getPrivateMessages(private_chat_id, function(err, msgs) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(msgs);
        }  
    });
});

app.get('/chatroom_msgs/:chatroom_id', function(req, res) {
    var chatroom_id = req.params.chatroom_id;
    chatUsers.getChatroomMessages(chatroom_id, function(err, msgs) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        if (err) {
            res.send(null);
        } else {
            res.send(msgs);
        }  
    });
});

app.post('/private_msg', function(req, res) {
    chatUsers.addPrivateMessage(req.body, function(msg) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(msg);
    });
});

app.post('/chatroom_msg', function(req, res) {
    chatUsers.addChatroomMessage(req.body, function(msg) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(msg);
    });
});

app.post('/chatroom', function(req, res) {
    chatUsers.addChatroom(req.body, function(err, chatroom) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
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
