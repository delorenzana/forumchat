var chatroom = null;
var user = null;
var username = null;
var user_id = null;
var is_moderator = false;
var currentMsgs = null;
var currentChatrooms = null;
var chatroomsLoaded = false;
var onlineUsers = null;
var avatar = null;
var socket = null;

$.fn.initChat = function(the_username, the_user_id, user_is_moderator, the_avatar){
    
    username = the_username;
    user_id = the_user_id;
    is_moderator = user_is_moderator;
    avatar = the_avatar;
    
    socket = io('http://localhost:3000');
    
           $('<div/>', {
             id: 'chatpopup'
           }).appendTo('#chat');
    
           $('<a/>', {
             text: 'Chat',
             href: '',
             onclick: 'return showHideChatrooms();'
           }).appendTo('#chatpopup');
    
           embedChatrooms();
    
    
    
}

function embedChatrooms(){
    
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
        socket.emit('chat room', { name: $('#c').val(), username: username, user_id: user_id });
        $('#c').val('');
      }
      return false;
    });

    socket.on('chat room', function(thechatroom){
      addChatroomToList(thechatroom);
      hideAddChatroom();
    });
    
    $('<div/>', {
      id: 'onlineusers',
      style: 'display:none;padding:10px'
    }).appendTo('#chatpopup');
    
     $('<h3/>', {
      text: 'Online Users'
    }).appendTo('#onlineusers');
    
    $('<ul/>', {
      id: 'online_users_list',
      style: 'list-style-type:none'
    }).appendTo('#onlineusers');
    
}

function showHideChatrooms(){
    
    if(!chatroomsLoaded){
        
        $.post(
        'http://localhost:3000/user', { user_id: user_id, username: username, is_moderator: is_moderator, avatar: avatar  }, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           user = data;
           
           $.get(
        'http://localhost:3000/chatrooms', {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           currentChatrooms = data;
           if(currentChatrooms){
             for(i in currentChatrooms){
               addChatroomToList(currentChatrooms[i]);
             }    
           }
           chatroomsLoaded = true; 
         }
       }
     );
           
           
         }else{
            console.log('error');
         }
         
         
        }
        );
     
        
    }
    
    $('#chatrooms').toggle();
    
    if($('#chatrooms').is(':visible')){
      $('#add_chatroom').hide();  
      $('#add_chatroom_link').text('+');  
      $('#onlineusers').show();  
      
      $('#online_users_list').empty();
      
      $.get(
        'http://localhost:3000/online_users', {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           onlineUsers = data;
           if(onlineUsers.length > 1){
             for(i in onlineUsers){
               addOnlineUserToList(onlineUsers[i]);
             }    
           }else{
               $('<li/>', {
                 text: "No one is available to chat."
               }).appendTo('#online_users_list');
           }
           
         }
       }
     );
      
    }else{
       $('#add_chatroom').show();
       $('#add_chatroom_link').text('-');  
       $('#onlineusers').hide();  
       $('#userchat').hide();
       $('#chatroom').hide();
    }

   return false;
}

function showHideAddChatroom(){
    
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

function showAddChatroom(){
    
    $('#add_chatroom').show();
    $('#add_chatroom_link').text('-');  
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
      $('<li/>', {
        id: theuser.user_id,
      }).appendTo('#online_users_list');
    
      $('<a/>', {
        text: theuser.username,
        href: '',
        onclick: "return startUserChat("+theuser.user_id+", '"+theuser.username+"');"
      }).appendTo('#'+theuser.user_id);
    }   
}

function showChatroom(thechatroom_id){
    
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
    socket.emit('start user chat', { user_id: user_id, with_user_id: with_user_id });
    
    socket.on('start user chat', function(userchat){
      showUserChat(userchat, with_username);
    });
    
    return false;
}

function showUserChat(userchat, with_username){
     
    $('#userchat').remove();
    socket.removeListener('userchat message');
             
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









