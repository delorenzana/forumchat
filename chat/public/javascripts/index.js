var chat_domain = 'http://localhost:3000';
var chat_container_id = 'chat';
var socket = null;
var open = false;
var user = null;
var online_seconds = null;

$.fn.initChat = function(options){
   
    if(typeof io !== 'undefined'){
      socket = io('http://localhost:3000');
      
      if(socket){
        var chatbar = new ChatBar();
        chatbar.init(options); 
      }
      
    }
}

function ChatBar() {
  this.init = function(options){
    online_seconds = options.online_seconds;
    delete options.online_seconds;
    this.setUser(options);
  }
  
  this.setUser = function(options){
    var self = this;
    doPost('/init', options, function(data){ 
      user = data;
      self.displayBar();
      self.setListeners();
    });
  };
  
  this.updateUser = function(){
    doPost('/user', user, function(data){
      // data
    });
  };
  
  this.setListeners = function(){
    var self = this;
    socket.on('chat_switched', function(obj){
      if(obj.user_id === user.user_id){
        user.available = obj.status ? 1:0;
        self.updateUser();
      }
    });  
    socket.on('chat_activity', function(user_id){
      if(user_id === user.user_id){
        self.updateUser();
      }
    });
    socket.on('user_login', function(user){
      addOnlineUserToList(user); 
    });
    socket.on('user_logout', function(user){
      removeOnlineUserFromList(user); 
    });
    socket.on('start_private_chat', function(privatechat){
      showUserChat(privatechat);
    });
    socket.on('send_private_msg', function(obj){
      addMsgToPrivateChat(obj);
      if(obj.user_id === user.user_id){
        sendPrivateMsg(obj);
      }
    });
  };
  
  this.displayBar = function(){
    var chat_container = document.getElementById(chat_container_id);
    
    chat_container.setAttribute("style","display:block");
    
    var chatBox = document.createElement("DIV");
      chatBox.setAttribute("id","chatbox");
      
    chat_container.appendChild(chatBox);
    
    // chatrooms
    
    var chatroomsDiv = document.createElement("DIV");
      chatroomsDiv.setAttribute("id","chatrooms");
      
    chatBox.appendChild(chatroomsDiv);
    
    // chatroom chat
    
    var chatroomchatDiv = document.createElement("DIV");
      chatroomchatDiv.setAttribute("id","chatroom_chat");
      
    chatBox.appendChild(chatroomchatDiv);
    
    // online users
    
    var onlineusersDiv = document.createElement("DIV");
      onlineusersDiv.setAttribute("id","online_users");
      
    chatBox.appendChild(onlineusersDiv);
    
    // private chat
    
    var privatechatDiv = document.createElement("DIV");
      privatechatDiv.setAttribute("id","private_chat");
      
    chatBox.appendChild(privatechatDiv);
    
    // chat bar
    
    var chatbarDiv = document.createElement("DIV");
      chatbarDiv.setAttribute("id","chat_bar");
      
    chatBox.appendChild(chatbarDiv);
    
    // chat link
    
    var chatLink = document.createElement("A");
      chatLink.id = 'chat_link';
      chatLink.href = '';
      chatLink.onclick = this.displayOnlineUsers;
      chatLink.innerHTML = "Chat";
      
    // online users count
    
    var chatLinkCount = document.createElement("SPAN");
      chatLinkCount.innerHTML = "(0)";
      
    chatLink.appendChild(chatLinkCount);
      
    chatbarDiv.appendChild(chatLink);
    
    // switch link
    
    var switchLink = document.createElement("A");
      switchLink.id = 'chat_switch_link';
      switchLink.className = user.available ? 'open_chat' : 'close_chat';
      switchLink.href = '';
      switchLink.onclick = this.switchChat;
      
    chatbarDiv.appendChild(switchLink);
    
    // chatrooms link
    
    var chatroomsLink = document.createElement("A");
      chatroomsLink.id = 'chatrooms_link';
      chatroomsLink.href = '';
      chatroomsLink.onclick = this.displayChatrooms;
      
//    var chatroomsLinkImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//    
//    chatroomsLink.appendChild(chatroomsLinkImg);
      
    chatbarDiv.appendChild(chatroomsLink);
    
    if(user.available){
      open = true;
      openChat();
    }else{
      open = false;
      closeChat();    
    }
    
    countOnlineUsers();
    
    return false;
  }
  
  this.displayOnlineUsers = function(){
    socket.emit('chat_activity', user.user_id);
    var onlineusersDiv = document.getElementById('online_users');
    var chatroomsDiv = document.getElementById('chatrooms');
    if(onlineusersDiv.innerHTML === ''){
      var onlineUsersHeader = document.createElement("P");
      onlineUsersHeader.innerHTML = "No one is available to chat.";
      onlineusersDiv.appendChild(onlineUsersHeader);
      
      var onlineUsersList = document.createElement("UL");
      onlineUsersList.id = 'online_users_list';
      onlineusersDiv.appendChild(onlineUsersList);
      
      getOnlineUsers();
      
      onlineusersDiv.style.display = 'block';
    }else{
      if(onlineusersDiv.style.display === 'none'){
        onlineusersDiv.style.display = 'block';
      }else{
        onlineusersDiv.style.display = 'none';
        $('#private_chat').hide();
      }
    }
    chatroomsDiv.style.display = 'none';
    
    return false;
  }
  
  this.displayChatrooms = function(){
    socket.emit('chat_activity', user.user_id);
    var chatroomsDiv = document.getElementById('chatrooms');
    var onlineusersDiv = document.getElementById('online_users');
    if(chatroomsDiv.innerHTML === ''){
      var chatroomsHeader = document.createElement("P");
      chatroomsHeader.innerHTML = "Chatrooms";
      chatroomsDiv.appendChild(chatroomsHeader);
      chatroomsDiv.style.display = 'block';
    }else{
      if(chatroomsDiv.style.display === 'none'){
        chatroomsDiv.style.display = 'block';
      }else{
        chatroomsDiv.style.display = 'none';
      }
    }
    onlineusersDiv.style.display = 'none';
    
    return false;
  }
  
  this.switchChat = function(){
    if(open){
      open = false;
      closeChat();
      socket.emit('user_logout', user);
    }else{
      open = true;
      openChat();
    }
    
    socket.emit('chat_switched', { user_id: user.user_id, status: open });
    
    return false;
  }
}

function openChat(){
  var chat_container = document.getElementById(chat_container_id);
  var chatLink = document.getElementById('chat_link');
  var chatroomsLink = document.getElementById('chatrooms_link');
  var switchLink = document.getElementById('chat_switch_link');
    
  chat_container.style.width = '400px';
  switchLink.className = 'open_chat';
  chatLink.style.display = 'block';
  chatroomsLink.style.display = 'block';
  
  socket.emit('user_login', user);
}
  
function closeChat(){
  var chat_container = document.getElementById(chat_container_id);
  var chatroomsDiv = document.getElementById('chatrooms');
  var onlineusersDiv = document.getElementById('online_users');
  var chatLink = document.getElementById('chat_link');
  var chatroomsLink = document.getElementById('chatrooms_link');
  var switchLink = document.getElementById('chat_switch_link');
    
  chat_container.style.width = '35px';
  chatroomsDiv.style.display = 'none';
  onlineusersDiv.style.display = 'none';
  chatLink.style.display = 'none';
  chatroomsLink.style.display = 'none';
  $('#private_chat').hide();
  switchLink.className = 'close_chat'; 
}

function doPost(query_string, options, callback){
  $.post(chat_domain+query_string, options, function(data, textStatus, jqXHR ) {
    if(textStatus === 'success'){
      callback(data);
    }else{
      callback(null);
    }
  }); 
};
  
function doGet(query_string, options, callback){
  $.get(chat_domain+query_string, options, function(data, textStatus, jqXHR ) {
    if(textStatus === 'success'){
      callback(data);
    }else{
      callback(null);
    }
  }); 
};

function countOnlineUsers(){
  doGet('/online_users/'+online_seconds, {}, function(data){
    $('#chat_link span').text(' ('+(data.length-1)+')'); 
  });
};

function getOnlineUsers(){
  doGet('/online_users/'+online_seconds, {}, function(data){ 
    users = data;
    var onlineusersList = document.getElementById('online_users_list');
    for(i in users){
      addOnlineUserToList(users[i]);
    }
  });
};

function getPrivateChat(the_user){
  doGet('/private_chat/'+user.user_id+'/'+the_user.user_id, {}, function(data){ 
    showPrivateChat(data, the_user);
  });
};

function sendPrivateMsg(obj){
  doPost('/private_msg', obj, function(data){ 
      
  });
};

function getPrivateChatMsgs(private_chat_id){
  doGet('/private_msgs/'+private_chat_id, {}, function(data){ 
    for(i in data){
      addMsgToPrivateChat(data[i]);
    }
    $('#private_chat_msgs_'+private_chat_id+' li').last().focus();
  });
};

function startPrivateChat(the_user){
  getPrivateChat(the_user);
  
  return false;  
}

function showPrivateChat(private_chat, the_user){
    
  $('#private_chat').show();
  $('.private_chat').hide();
  
  var privatechatDiv = document.getElementById('private_chat');
  
  if($('#private_chat').find('#'+private_chat._id).length === 0){
    var privatechatBlock = document.createElement("DIV");
    privatechatBlock.id = private_chat._id;
    privatechatBlock.className = 'private_chat';
  
    privatechatDiv.appendChild(privatechatBlock);
    
    var privatechatHeader = document.createElement("p");
    privatechatHeader.innerHTML = the_user.username;
    
    privatechatBlock.appendChild(privatechatHeader);
    
    var privatechatMsgs = document.createElement("UL");
    privatechatMsgs.id = 'private_chat_msgs_'+private_chat._id;
    
    privatechatBlock.appendChild(privatechatMsgs);
  
    var privatechatForm = document.createElement("FORM");
    privatechatForm.id = 'private_chat_form_'+private_chat._id;
    privatechatForm.action = '';
  
    privatechatBlock.appendChild(privatechatForm);
    
    $('<textarea/>', {
      id: 'pc_msg_'+private_chat._id,
      keypress: function(event) {
    if (event.which == 13) {
        event.preventDefault();
        $('#private_chat_form_'+private_chat._id).submit();
    }
}
    }).appendTo('#private_chat_form_'+private_chat._id);
    
    $('#private_chat_form_'+private_chat._id).submit(function(){
      if($('#pc_msg_'+private_chat._id).val()){
        socket.emit('send_private_msg', { private_chat_id: private_chat._id, message: $('#pc_msg_'+private_chat._id).val(), user_id: user.user_id, avatar: user.avatar, with_user_id: the_user.user_id, username: user.username });
        $('#pc_msg_'+private_chat._id).val('');
      }
      return false;
    });
  
    //privatechatForm.appendChild(privatechatInput);
  }else{
    $('#private_chat').find('#'+private_chat._id).show(); 
  }
  
  $('#private_chat_msgs_'+private_chat._id).empty();
  getPrivateChatMsgs(private_chat._id);
}

function addOnlineUserToList(theuser){
  if((theuser.user_id !== user.user_id) && ($('#online_users_list').find('#'+theuser.user_id).length === 0)){
    var onlineusersList = document.getElementById('online_users_list');
  
    if(onlineusersList){
      var onlineUserItem = document.createElement("LI");
      onlineUserItem.id = theuser.user_id;
        
      var onlineUserItemLink = document.createElement("A");
      onlineUserItemLink.text = theuser.username;
      onlineUserItemLink.href = '';
      onlineUserItemLink.onclick = function() { return startPrivateChat(theuser) };
      
      onlineUserItem.appendChild(onlineUserItemLink);
    
      onlineusersList.appendChild(onlineUserItem); 
      
      $('#online_users p').hide();
      
      $('#chat_link span').text(' ('+$('#online_users_list li').length+')'); 
    }
  }
}

function removeOnlineUserFromList(theuser){
  if($('#online_users_list').find('#'+theuser.user_id).length !== 0){
    $('#online_users_list').find('#'+theuser.user_id).remove();
  }
}

function addMsgToPrivateChat(obj){
    var privatechatMsgs = document.getElementById('private_chat_msgs_'+obj.private_chat_id);
    var last_tab_index = $('#private_chat_msgs_'+obj.private_chat_id+' li').last().attr('tabindex');
    
    if(privatechatMsgs){
      var privatechatMsg = document.createElement("LI");
      privatechatMsg.tabIndex = ++last_tab_index;
      
      var privatechatImg = document.createElement("IMG");
      privatechatImg.src = obj.avatar;
      privatechatImg.onerror = function(){ privatechatImg.src = chat_domain+"/images/img-no-avatar.gif"; };
      privatechatMsg.appendChild(privatechatImg);
      
      var privatechatUsername = document.createElement("SPAN");
      privatechatUsername.innerHTML = obj.username;
      privatechatMsg.appendChild(privatechatUsername);
      
      var privatechatText = document.createElement("P");
      privatechatText.innerHTML = obj.message;
      privatechatMsg.appendChild(privatechatText);
    
      privatechatMsgs.appendChild(privatechatMsg);
      
      $('#private_chat_msgs_'+obj.private_chat_id+' li').last().focus();
  }
}