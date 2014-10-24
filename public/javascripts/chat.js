var chatroom = null;
var username = null;
var user_id = null;
var currentMsgs = null;
var currentChatrooms = null;
var chatroomsLoaded = false;
var socket = null;

$.fn.initChat = function(the_username, the_user_id){
    
    username = the_username;
    user_id = the_user_id;

    socket = io('http://localhost:3000');
    
     $('<a/>', {
      text: 'Chat',
      href: '',
      onclick: 'return showHideChatrooms();'
    }).appendTo('#chat');
    
    embedChatrooms();
}

function embedChatrooms(){
    
    $('<div/>', {
      id: 'chatrooms',
      style: 'display:none;padding:10px'
    }).appendTo('#chat');
    
     $('<h3/>', {
      text: 'Chatrooms'
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

   return false;
}

function showHideAddChatroom(){
    
    $('#add_chatroom').toggle();
    
    if($('#add_chatroom').is(':visible')){
       $('#add_chatroom_link').text('-');  
    }else{
       $('#add_chatroom_link').text('+');  
    }

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
                 socket.emit('chat message', { message: $('#m').val(), user_id: user_id, room_id: chatroom._id});
                 $('#m').val('');
               }
               return false;
             });

             socket.on('chat message', function(msg){
               if(msg.room_id === chatroom._id){
                 $('#msgs'+chatroom._id).append($('<li>').text(msg.message));
               }
             });

             $.get(
               'http://localhost:3000/messages/'+chatroom._id, {}, function(data, textStatus, jqXHR ) {
               currentMsgs = data;
               if(currentMsgs){
                 for(i in currentMsgs){
                     console.log(i);
                   $('#msgs'+chatroom._id).append($('<li>').text(currentMsgs[i].message));
                 }    
               }
             });
           } 
         }
       }
     );
     
     return false;
}









