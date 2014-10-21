var chatroom = null;
var currentMsgs = null;

function showCurrentMessages(){
  if(currentMsgs){
    for(i in currentMsgs){
      $('#'+chatroom).append($('<li>').text(currentMsgs[i].message));
    }    
  }
}
      
var socket = io();
$('form').submit(function(){
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

$(document).ready(function(){
      showCurrentMessages();
});