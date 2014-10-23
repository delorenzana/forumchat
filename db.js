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

function saveMsg(msg){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("messages");
      collection.insert(msg);
  });
}

function getMsgs(query, callback){
  startDb();
  db.open(function(err, db) {
    var collection = db.collection("messages");
    collection.find(query).toArray(function(err, messages) {
       if(!messages || err){
        callback(true);
       }else{
        callback(false, messages);   
       }
        db.close();
      });
  });
}

module.exports.startDb = startDb;
module.exports.saveMsg = saveMsg;
module.exports.getMsgs = getMsgs;