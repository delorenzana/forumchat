var chatroom = null;
var currentMsgs = null;

$.fn.initChat = function(thechatroom){
    chatroom = thechatroom;
    jQuery('<p/>', {
      text: chatroom
    }).appendTo('#chat');

    jQuery('<ul/>', {
      id: chatroom,
      style: 'list-style-type:none'
    }).appendTo('#chat');

    jQuery('<form/>', {
      action: '',
      id: 'chat_form'
    }).appendTo('#chat');

    jQuery('<input/>', {
      id: 'm',
      autocomplete: 'off'
    }).appendTo('#chat_form');

    jQuery('<button/>', {
      text: 'Send'
    }).appendTo('#chat_form');

    var socket = io('http://localhost:3000');

    $('#chat_form').submit(function(){
      if($('#m').val()){
        socket.emit('chat message', { message: $('#m').val(), room: chatroom});
        $('#m').val('');
      }
      return false;
    });

    socket.on('chat message', function(msg){
      if(msg.room === chatroom){
        $('#'+chatroom).append($('<li>').text(msg.message));
      }
    });

    $.get(
      'http://localhost:3000/'+chatroom, {}, function(data, textStatus, jqXHR ) {
        currentMsgs = data;
        if(currentMsgs){
          for(i in currentMsgs){
            $('#'+chatroom).append($('<li>').text(currentMsgs[i].message));
          }    
        }
      }
   );
}









