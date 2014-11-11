var events = require('events');
var dbMod = require('./db.js');

function Chat() {
  this.user_count = 0;
  this.users = [];
  events.EventEmitter.call(this);
  this.addUser = function(user){
    this.user_count++;
    user.user_id = parseInt(user.user_id);
    user.is_moderator = parseInt(user.is_moderator);
    this.users.push(user);
    this.emit('userAdded', user);
  };
  this.on("userAdded", function(user){
    addUser(this, user);
  });
}
Chat.prototype.__proto__ = events.EventEmitter.prototype;

function addUser(chat, user){
  console.log("User added");
  console.log(chat.users);
  console.log(chat.user_count);
}

module.exports.Chat = Chat;
module.exports.addUser = addUser;

