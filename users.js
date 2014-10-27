function getOnlineUsers(sql, req, callback){
    req.getConnection(function(err,connection){
      var query = connection.query(sql ,function(err, users){
        if(err){
          callback(true);
        }else{
          callback(false, users);   
        }   
      }
    );
  });
}

module.exports.getOnlineUsers = getOnlineUsers;


