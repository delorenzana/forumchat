var chatroom = null;
var username = null;
var user_id = null;
var is_moderator = false;
var currentMsgs = null;
var currentChatrooms = null;
var chatroomsLoaded = false;
var onlineUsers = null;
var socket = null;

$.fn.initChat = function(the_username, the_user_id, user_is_moderator){
    
    username = the_username;
    user_id = the_user_id;
    is_moderator = user_is_moderator;
    
    //console.log(is_moderator);
    
    socket = io('http://localhost:3000');
    
     $('<a/>', {
      text: 'Chat',
      href: '',
      onclick: 'return showHideChatrooms();'
    }).appendTo('#chat');
    
//    $('<img/>', {
//      src: 'data/avatars/s/0/'+user_id+'.jpg'
//    }).appendTo('#chat');
    
    embedChatrooms();
}

function embedChatrooms(){
    
    $('<div/>', {
      id: 'chatrooms',
      style: 'display:none;padding:10px'
    }).appendTo('#chat');
    
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
      showHideAddChatroom();
    });
    
    $('<div/>', {
      id: 'onlineusers',
      style: 'display:none;padding:10px'
    }).appendTo('#chat');
    
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
    }
    
    $('#chatrooms').toggle();
    
    if($('#chatrooms').is(':visible')){
      $('#add_chatroom').hide();  
      $('#add_chatroom_link').text('+');  
      $('#onlineusers').show();  
      
      $.get(
        'http://localhost:3000/online_users', {}, function(data, textStatus, jqXHR ) {
         if(textStatus === 'success'){
           onlineUsers = data;
           if(onlineUsers){
             for(i in onlineUsers){
               addOnlineUserToList(onlineUsers[i]);
             }    
           }
           chatroomsLoaded = true; 
         }
       }
     );
      
    }else{
       $('#add_chatroom').show();
       $('#add_chatroom_link').text('-');  
       $('#onlineusers').hide();  
    }

   return false;
}

function showHideAddChatroom(){
    
    $('#add_chatroom').toggle();
    
    if($('#add_chatroom').is(':visible')){
       $('#add_chatroom_link').text('-');  
       $('#chatroom').remove();
       socket.removeListener('chat message');
    }else{
       $('#add_chatroom_link').text('+');  
    }

    //$('#chatroom').remove();
    //socket.removeListener('chat message');
             
   return false;
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

function addOnlineUserToList(theuser){
    if(theuser.user_id !== user_id){
      $('<li/>', {
        id: theuser.user_id,
      }).appendTo('#online_users_list');
    
      $('<a/>', {
        text: theuser.username,
        href: '',
        onclick: "return showUserChat('"+theuser.user_id+"', '"+theuser.username+"');"
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
             }).appendTo('#chat');
    
             $('<p/>', {
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

             $('<input/>', {
               id: 'm',
               autocomplete: 'off'
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
                 $('<li/>', {
                     id: msg.room_id+'_'+i,
                     text: msg.message
                 }).appendTo('#msgs'+chatroom._id);
                 $('<img/>', {
                     src: 'data/avatars/s/0/'+msg.user_id+'.jpg'
                 }).appendTo('#msgs'+chatroom._id).last();
                 $('<span/>', {
                     text: msg.username
                 }).appendTo('#msgs'+chatroom._id).last();
               }
             });

             $.get(
               'http://localhost:3000/messages/'+chatroom._id, {}, function(data, textStatus, jqXHR ) {
               currentMsgs = data;
               if(currentMsgs){
                 for(i in currentMsgs){
                   $('<li/>', {
                     text: currentMsgs[i].message
                    }).appendTo('#msgs'+chatroom._id);
                   $('<img/>', {
                     src: 'data/avatars/s/0/'+currentMsgs[i].user_id+'.jpg'
                    }).appendTo('#msgs'+chatroom._id).last();
                    $('<span/>', {
                     text: currentMsgs[i].username
                 }).appendTo('#msgs'+chatroom._id).last();
                 }    
               }
             });
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

function showUserChat(with_user_id, with_username){
     
    $('#userchat').remove();
    socket.removeListener('userchat message');
             
    $('<div/>', {
      id: 'userchat',
      style: 'padding:10px'
    }).appendTo('#chat');
    
    $('<p/>', {
      text: with_username
    }).appendTo('#userchat');

    $('<ul/>', {
      id: 'userchatmsgs'+user_id+'-'+with_user_id,
      style: 'list-style-type:none'
    }).appendTo('#userchat');

    $('<form/>', {
      action: '',
      id: 'userchat_form'
    }).appendTo('#userchat');

    $('<input/>', {
      id: 'ucm',
      autocomplete: 'off'
    }).appendTo('#userchat_form');

    $('<button/>', {
      text: 'Send'
    }).appendTo('#userchat_form');
    
//    $('#userchat_form').submit(function(){
//      if($('#ucm').val()){
//        socket.emit('userchat message', { message: $('#ucm').val(), user_id_1: user_id, user_id_2: with_user_id, username: username });
//        $('#ucm').val('');
//      }
//      return false;
//    });
//
//    socket.on('userchat message', function(msg){
//      if((msg.user_id_1 === user_id) || (msg.user_id_2 === user_id)){
//        $('<li/>', {
//          id: msg.user_id_1+'_'+msg.user_id_2,
//          text: msg.message
//        }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id);
//        $('<img/>', {
//          src: 'data/avatars/s/0/'+msg.user_id_1+'.jpg'
//        }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id).last();
//        $('<span/>', {
//          text: msg.username
//        }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id).last();
//      }
//    });
//
//    $.get(
//      'http://localhost:3000/userchatmsgs/'+user_id+'/'+with_user_id, {}, function(data, textStatus, jqXHR ) {
//      var userChatMsgs = data;
//      if(userChatMsgs){
//        for(i in userChatMsgs){
//          $('<li/>', {
//            text: userChatMsgs[i].message
//          }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id);
//          $('<img/>', {
//            src: 'data/avatars/s/0/'+userChatMsgs[i].user_id+'.jpg'
//                    }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id).last();
//                    $('<span/>', {
//                     text: userChatMsgs[i].username
//                 }).appendTo('#userchatmsgs'+user_id+'-'+with_user_id).last();
//                 }    
//               }
//             });
           
     
     return false;
}









