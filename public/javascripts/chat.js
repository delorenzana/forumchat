var options = null;
var chatroom = null;
var user = null;
var username = null;
var user_id = null;
var is_moderator = false;
var currentMsgs = null;
var chatLoaded = false;
var avatar = null;
var online_seconds = null;
var online_users_header_text = 'Online Users';
var socket = null;

$.fn.initChat = function(the_options){
    
    username = the_options.username;
    user_id = the_options.user_id;
    is_moderator = the_options.is_moderator;
    avatar = the_options.avatar;
    online_seconds = the_options.online_seconds;
    
    options = the_options;
    
   
    
    socket = io('http://localhost:3000');
    
           $('<div/>', {
             id: 'chatpopup'
           }).appendTo('#chat');
    
           $('<a/>', {
             text: 'Chat',
             href: '',
             onclick: 'return showHideChatrooms();'
           }).appendTo('#chatpopup');
    
           embedChat(); 
           initializeUser();
}

function initializeUser(){
     $.post(
        'http://localhost:3000/user', { user_id: options.user_id, username: options.username, is_moderator: options.is_moderator, avatar: options.avatar  }, function(data, textStatus, jqXHR ) {
           if(textStatus === 'success'){
             user = data;
             socket.emit('user login', user);
             socket.on('user login', function(the_user){
               addOnlineUserToList(the_user); 
             });
           }else{
             user = null;
           }
        }
      );
}

function updateUser(){
    if(user){
      $.post(
        'http://localhost:3000/user', { user_id: user.user_id, username: user.username, is_moderator: user.is_moderator, avatar: user.avatar  }, function(data, textStatus, jqXHR ) {
           if(textStatus === 'success'){
             user = data;
           }else{
             user = null;
           }
        }
      );   
    }
}

function embedChat(){
    
    // chatrooms
    
    $('<div/>', {
      id: 'chatrooms',
      style: 'display:none;padding:10px'
    }).appendTo('#chatpopup');
    
     $('<h3/>', {
      text: 'Chat Rooms'
    }).appendTo('#chatrooms');
    
    $('<ul/>', {
      id: 'chatrooms_list',
      style: 'list-style-type:none'
    }).appendTo('#chatrooms');
    
    $('<a/>', {
      id: 'add_chatroom_link',
      text: '+',
      href: '',
      title: 'Add a chatroom',
      onclick: 'return showHideAddChatroom();'
    }).appendTo('#chatrooms');
    
     $('<ul/>', {
      id: 'chatrooms_list',
      style: 'list-style-type:none;'
    }).appendTo('#chatrooms');
    
    // add chatroom
    
    $('<div/>', {
      id: 'add_chatroom',
      style: 'display:none;padding:10px'
    }).appendTo('#chatrooms');
    
     $('<form/>', {
      action: '',
      id: 'add_chat_form'
    }).appendTo('#add_chatroom');

    $('<input/>', {
      id: 'c',
      autocomplete: 'off'
    }).appendTo('#add_chat_form');

    $('<button/>', {
      text: 'Add'
    }).appendTo('#add_chat_form');
    
    $('#add_chat_form').submit(function(){
      if($('#c').val()){
        updateUser();
        socket.emit('chat room', { name: $('#c').val(), username: username, user_id: user_id });
        $('#c').val('');
      }
      return false;
    });

    socket.on('chat room', function(thechatroom){
      addChatroomToList(thechatroom);
      hideAddChatroom();
    });
    
    // online users
    
    $('<div/>', {
      id: 'onlineusers',
      style: 'display:none;padding:10px'
    }).appendTo('#chatpopup');
    
     $('<h3/>', {
      text: online_users_header_text
    }).appendTo('#onlineusers').append($('<span/>', {
                     text: ' (0)'
                 }));
                 
    $('<p/>', {
      text: 'No one is available to chat.'
    }).appendTo('#onlineusers');
    
    $('<ul/>', {
      id: 'online_users_list',
      style: 'list-style-type:none'
    }).appendTo('#onlineusers');
    
}

function showHideChatrooms(){
    updateUser();
    if(!chatLoaded){
       updateChatrooms();
       updateOnlineUsers();
       chatLoaded = true;
    }
    
    $('#chatrooms').toggle();
    
    if($('#chatrooms').is(':visible')){
      $('#add_chatroom').hide();  
      $('#add_chatroom_link').text('+');  
      $('#onlineusers').show();  
      
    }else{
       $('#add_chatroom').show();
       $('#add_chatroom_link').text('-');  
       $('#onlineusers').hide();  
       $('#userchat').hide();
       $('#chatroom').hide();
    }

   return false;
}

function updateOnlineUsers(){
    $('#online_users_list').empty();
    $.get(
        'http://localhost:3000/online_users/'+options.online_seconds, {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           if(data.length > 1){
             $('#onlineusers p').hide();
             for(i in data){
               addOnlineUserToList(data[i]);
             } 
           }else{
               $('#onlineusers p').show();
           }
         }
       }
     );
}

function updateChatrooms(){
   $.get(
        'http://localhost:3000/chatrooms', {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           if(data){
             for(i in data){
               addChatroomToList(data[i]);
             }    
           } 
         }
       }
     );
}

function showHideAddChatroom(){
    updateUser();
    $('#add_chatroom').toggle();
    
    if($('#add_chatroom').is(':visible')){
       $('#add_chatroom_link').text('-');  
       $('#add_chatroom form input').focus();
       $('#chatroom').remove();
       socket.removeListener('chat message');
    }else{
       $('#add_chatroom_link').text('+');  
    }
             
   return false;
}

function hideAddChatroom(){
    
    $('#add_chatroom').hide();
    $('#add_chatroom_link').text('+');  
}

function addChatroomToList(thechatroom){
    $('<li/>', {
      id: thechatroom._id,
    }).appendTo('#chatrooms_list');
    
     $('<a/>', {
      text: thechatroom.name,
      href: '',
      onclick: "return showChatroom('"+thechatroom._id+"');"
    }).appendTo('#'+thechatroom._id);
}

function addUserChatToList(userchat){
    $('<li/>', {
      id: userchat._id,
    }).appendTo('#userchat_list');
    
     $('<a/>', {
      text: userchat.with_user_id,
      href: '',
      onclick: "return showChatroom('"+userchat._id+"');"
    }).appendTo('#'+userchat._id);
}

function addOnlineUserToList(theuser){
    if(theuser.user_id !== user_id){
     
      
      if($('#online_users_list').find('#'+theuser.user_id).length === 0){
        $('<li/>', {
          id: theuser.user_id,
        }).prependTo('#online_users_list');
    
        $('<a/>', {
          text: theuser.username,
          href: '',
          onclick: "return startUserChat("+theuser.user_id+", '"+theuser.username+"');"
        }).appendTo('#'+theuser.user_id).append($('<span/>', {
                     text: ' (0)'
                 }));
      $('#onlineusers p').hide();
         
      }
      
      $('#onlineusers h3 span').text(' ('+$('#onlineusers li').length+')');  
    }   
}

function showChatroom(thechatroom_id){
    
    updateUser();
    
    $.get(
        'http://localhost:3000/chatroom/'+thechatroom_id, {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           chatroom = data;
           if(chatroom){
             
             $('#chatroom').remove();
             socket.removeListener('chat message');
             
             $('<div/>', {
               id: 'chatroom',
               style: 'padding:10px'
             }).appendTo('#chatrooms');
    
             $('<h3/>', {
               text: chatroom.name
             }).appendTo('#chatroom');

             $('<ul/>', {
               id: 'msgs'+chatroom._id,
               style: 'list-style-type:none'
             }).appendTo('#chatroom');

             $('<form/>', {
               action: '',
               id: 'chat_form'
             }).appendTo('#chatroom');

             $('<textarea/>', {
               id: 'm'
             }).appendTo('#chat_form');

             $('<button/>', {
               text: 'Send'
             }).appendTo('#chat_form');
    
             $('#chat_form').submit(function(){
               if($('#m').val()){
                 updateUser();
                 socket.emit('chat message', { message: $('#m').val(), user_id: user_id, username: username, room_id: chatroom._id});
                 $('#m').val('');
               }
               return false;
             });

             socket.on('chat message', function(msg){
               if(msg.room_id === chatroom._id){
                   
                   $('<li/>', {}).prependTo('#msgs'+chatroom._id).append($('<img/>', {
                     src: 'data/avatars/s/0/'+msg.user_id+'.jpg'
                    })).append($('<span/>', {
                     text: msg.username
                 })).append($('<p/>', {
                     text: msg.message
                    }));
                    
                 
                 
                 $('#msgs'+chatroom._id).scrollTop($('#msgs'+chatroom._id).length);
               }
             });

             $.get(
               'http://localhost:3000/messages/'+chatroom._id, {}, function(data, textStatus, jqXHR ) {
               currentMsgs = data;
               if(currentMsgs){
                 for(i in currentMsgs){
                     
                   $('<li/>', {}).appendTo('#msgs'+chatroom._id).append($('<img/>', {
                     src: 'data/avatars/s/0/'+currentMsgs[i].user_id+'.jpg'
                    })).append($('<span/>', {
                     text: currentMsgs[i].username
                 })).append($('<p/>', {
                     text: currentMsgs[i].message
                    }));
             
                 }    
               }
             });
             
             $('#chatroom form textarea').focus();
           } 
         }
       }
     );
     
     if($('#add_chatroom').is(':visible')){
      $('#add_chatroom').hide();  
      $('#add_chatroom_link').text('+');  
    }
     
     return false;
}

function startUserChat(with_user_id, with_username){
    
    updateUser();
    
    socket.emit('start user chat', { user_id: user_id, with_user_id: with_user_id });
    
    socket.on('start user chat', function(userchat){
      showUserChat(userchat, with_username);
    });
    
    return false;
}

function showUserChat(userchat, with_username){
     
    $('#userchat').remove();
    socket.removeListener('start user chat');
    socket.removeListener('userchat message');
    
    $('#online_users_list').find('#'+userchat.with_user_id+' span').text(' (0)');
    console.log(userchat.with_user_id);
             
    $('<div/>', {
      id: 'userchat',
      style: 'padding:10px'
    }).appendTo('#onlineusers');
    
    $('<p/>', {
      text: with_username
    }).appendTo('#userchat');

    $('<ul/>', {
      id: 'userchatmsgs'+userchat._id,
      style: 'list-style-type:none'
    }).appendTo('#userchat');

    $('<form/>', {
      action: '',
      id: 'userchat_form'
    }).appendTo('#userchat');

    $('<textarea/>', {
      id: 'ucm',
      autocomplete: 'off'
    }).appendTo('#userchat_form');

    $('<button/>', {
      text: 'Send'
    }).appendTo('#userchat_form');
    
    $('#userchat_form').submit(function(){
      if($('#ucm').val()){
        updateUser();
        socket.emit('userchat message', { private_chat_id: userchat._id, message: $('#ucm').val(), user_id: user_id, username: username, with_user_id: userchat.with_user_id });
        $('#ucm').val('');
      }
      return false;
    });

    socket.on('userchat message', function(msg){
      if(msg.private_chat_id === userchat._id){
          
        $('<li/>', {}).prependTo('#userchatmsgs'+userchat._id).append($('<img/>', {
                     src: 'data/avatars/s/0/'+msg.user_id+'.jpg'
                    })).append($('<span/>', {
                     text: msg.username
                 })).append($('<p/>', {
                     text: msg.message
                    }));
                    
                    $('#userchatmsgs'+userchat._id).scrollTop($('#userchatmsgs'+userchat._id).length);
                    
                    //console.log(userchat._id);
                    
                    $('#online_users_list').find('#'+msg.user_id+' span').text(' (1)');
        
      }
    });
    
    

    $.get(
      'http://localhost:3000/userchatmsgs/'+userchat._id, {}, function(data, textStatus, jqXHR ) {
      var userChatMsgs = data;
      if(userChatMsgs){
        $('#userchatmsgs'+userchat._id).empty();
        for(i in userChatMsgs){
            
            $('<li/>', {}).appendTo('#userchatmsgs'+userchat._id).append($('<img/>', {
                     src: 'data/avatars/s/0/'+userChatMsgs[i].user_id+'.jpg'
                    })).append($('<span/>', {
                     text: userChatMsgs[i].username
                 })).append($('<p/>', {
                     text: userChatMsgs[i].message
                    })); 
        }    
      }
      });
      
      $('#userchat form textarea').focus();
}









