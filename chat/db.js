var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');
    db = null;
    
function startDb(){
  db = new Db('chat', new Server('localhost', 27017), {safe:false});
}

function saveChatroom(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("chatrooms");
    collection.insert(query, function(err) {
       if(err){
        callback(true);
       }else{
        callback(false, query);   
       }
        db.close();
      });
  });
}

function savePrivateChat(query, callback){
  startDb();
  db.open(function(err, db) {
    query.user_id = parseInt(query.user_id);
    query.with_user_id = parseInt(query.with_user_id);
    query.created_at = new Date().getTime();
    var collection = db.collection("privatechats");
    collection.findOne({ $or: [ { user_id: query.user_id, with_user_id: query.with_user_id }, { user_id: query.with_user_id, with_user_id: query.user_id } ] }, function(err, privatechat){
      if(!privatechat || err){
        collection.insert(query, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, query);   
        }
          db.close();
        });
      }else{
        callback(false, privatechat);   
      }
    });
  });
}

function getChatrooms(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("chatrooms");
    collection.find(query).toArray(function(err, chatrooms) {
       if(!chatrooms || err){
        callback(true);
       }else{
        callback(false, chatrooms);   
       }
        db.close();
      });
  });
}

function getChatroom(query, callback){
    startDb();
    db.open(function(err, db) {
      var collection = db.collection("chatrooms");
      collection.findOne(query, function(err, chatroom){
           if(!chatroom || err){
            callback(true);
          }else{
            callback(false, chatroom);   
          }
      });
    });
}


function saveMsg(msg){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("messages");
      collection.insert(msg);
  });
}

function savePrivateMsg(msg, callback){
  startDb();
  db.open(function(err, db) {
    msg.user_id = parseInt(msg.user_id);
    msg.with_user_id = parseInt(msg.with_user_id);
    var collection = db.collection("privatemessages");
      collection.insert(msg, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, msg);   
        }
          db.close();
        });
  });
}

function getMsgs(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("messages");
    collection.find(query).sort({ created_date: -1 }).toArray(function(err, messages) {
       if(!messages || err){
        callback(true);
       }else{
        callback(false, messages);   
       }
        db.close();
      });
  });
}

function getPrivateMsgs(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("privatemessages");
    collection.find(query).sort({ created_date: 1 }).toArray(function(err, messages) {
       if(!messages || err){
        callback(true);
       }else{
        callback(false, messages);   
       }
        db.close();
      });
  });
}

function initUser(query, callback){
  startDb();
  db.open(function(err, db) {
    query.user_id = parseInt(query.user_id);
    query.is_moderator = parseInt(query.is_moderator);
    query.last_online = new Date().getTime();
    var collection = db.collection("users");
    collection.findOne({ user_id: query.user_id }, function(err, user){
      if(!user || err){
        query.available = 0;
        collection.insert(query, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, query);   
        }
          db.close();
        });
      }else{
        collection.update({ user_id: query.user_id }, { $set: { username: query.username, is_moderator: query.is_moderator, avatar: query.avatar, last_online: query.last_online } }, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, user);   
        }
          db.close();
        }); 
      }
    });
  });
}

function updateUser(query, callback){
  startDb();
  db.open(function(err, db) {
    query.user_id = parseInt(query.user_id);
    query.is_moderator = parseInt(query.is_moderator);
    query.last_online = new Date().getTime();
    query.available = parseInt(query.available);
    var collection = db.collection("users");
    collection.findOne({ user_id: query.user_id }, function(err, user){
      if(!user || err){
        query.available = 0;
        collection.insert(query, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, query);   
        }
          db.close();
        });
      }else{
        collection.update({ user_id: query.user_id }, { $set: { username: query.username, is_moderator: query.is_moderator, avatar: query.avatar, available: query.available, last_online: query.last_online } }, function(err) {
        if(err){
          callback(true);
        }else{
          callback(false, query);   
        }
          db.close();
        }); 
      }
    });
  });
}

function getOnlineUsers(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("users");
    collection.find(query).sort({ username: -1 }).toArray(function(err, users) {
       if(!users || err){
        callback(true);
       }else{
        callback(false, users);   
       }
        db.close();
      });
  });
}

module.exports.startDb = startDb;
module.exports.saveMsg = saveMsg;
module.exports.savePrivateMsg = savePrivateMsg;
module.exports.getMsgs = getMsgs;
module.exports.getPrivateMsgs = getPrivateMsgs;
module.exports.saveChatroom = saveChatroom;
module.exports.savePrivateChat = savePrivateChat;
module.exports.getChatrooms = getChatrooms;
module.exports.getChatroom = getChatroom;
module.exports.initUser = initUser;
module.exports.updateUser = updateUser;
module.exports.getOnlineUsers = getOnlineUsers;