var chat_domain = 'http://localhost:3000';
var chat_container_id = 'chat';
var socket = null;

var initChat = function(options){
    if(typeof io !== 'undefined'){
        socket = io(chat_domain);
        if(socket){
            var chatbar = new ChatBar();
            chatbar.init(options); 
        }
    }
}

function ChatBar() {
    var self = this;
    this.user = null;
    this.online_seconds;
    this.open = false;
    this.init = function(options){
        this.online_seconds = options.online_seconds;
        delete options.online_seconds;
        this.setUser(options);
    }
  
    this.setUser = function(options){
        this.doPost('/init', options, function(data){ 
            self.user = data;
            self.displayBar();
            if(self.user.available){
                self.displayOnlineUsers();
            }
            self.setListeners();
        });
    };
  
    this.updateUser = function(){
        this.doPost('/update', this.user, function(data){
            this.user = data;
        });
    };
  
    this.setListeners = function(){
        socket.on('user_login', function(user){
            self.addOnlineUserToList(user); 
        });
        socket.on('user_logout', function(user){
            self.removeOnlineUserFromList(user); 
        });
        socket.on('add_msg_to_private_chat', function(obj){
            self.addMsgToPrivateChat(obj);
            self.notifyUserOfMessage(obj);
        });
        socket.on('add_chatroom_to_list', function(obj){
            self.addChatroomToList(obj);
        });
        socket.on('add_msg_to_chatroom', function(obj){
            self.addMsgToChatroomChat(obj);
            self.notifyChatroomMessage(obj);
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
        switchLink.className = this.user.available ? 'open_chat' : 'close_chat';
        switchLink.href = '';
        switchLink.onclick = this.switchChat;
      
        chatbarDiv.appendChild(switchLink);
    
        // chatrooms link
    
        var chatroomsLink = document.createElement("A");
        chatroomsLink.id = 'chatrooms_link';
        chatroomsLink.href = '';
        chatroomsLink.onclick = this.displayChatrooms;
      
        chatbarDiv.appendChild(chatroomsLink);
    
        if(this.user.available){
            this.open = true;
            this.openChat();
        }else{
            this.open = false;
            this.closeChat();    
        }
    
        return false;
    }
  
    this.displayOnlineUsers = function(){
        var onlineusersDiv = document.getElementById('online_users');
        var chatroomsDiv = document.getElementById('chatrooms');
        if(onlineusersDiv.innerHTML === ''){
            var onlineUsersHeader = document.createElement("P");
            onlineUsersHeader.innerHTML = "No one is available to chat.";
            onlineusersDiv.appendChild(onlineUsersHeader);
      
            var onlineUsersList = document.createElement("UL");
            onlineUsersList.id = 'online_users_list'+this.user.user_id;
            onlineusersDiv.appendChild(onlineUsersList);
      
            this.getOnlineUsers();
      
            onlineusersDiv.style.display = 'block';
        }else{
            if(onlineusersDiv.style.display === 'none'){
                onlineusersDiv.style.display = 'block';
            }else{
                onlineusersDiv.style.display = 'none';
                document.getElementById('private_chat').style.display = 'none';
            }
        }
        chatroomsDiv.style.display = 'none';
        
        self.setDisplay('.chatroom_chat', 'none');
    
        return false;
    }
    
    this.turnObjToArray = function(obj) {
        return [].map.call(obj, function(element) {
            return element;
        })
    };
    
    this.setDisplay = function(selector, display){
        var elements = this.turnObjToArray(document.querySelectorAll(selector));
        if(elements){
            for(i in elements){
                elements[i].style.display = display;
            }
        }
    };
  
    this.displayChatrooms = function(){
        var chatroomsDiv = document.getElementById('chatrooms');
        var onlineusersDiv = document.getElementById('online_users');
        if(chatroomsDiv.innerHTML === ''){
            var chatroomsHeader = document.createElement("P");
            chatroomsHeader.innerHTML = "Chatrooms";
            chatroomsDiv.appendChild(chatroomsHeader);
            chatroomsDiv.style.display = 'block';
      
            var chatroomsList = document.createElement("UL");
            chatroomsList.id = 'chatrooms_list';
            chatroomsDiv.appendChild(chatroomsList);
      
            self.getChatrooms();
      
            if(self.user.is_moderator){
                var addChatroomLink = document.createElement("A");
                addChatroomLink.id = "add_chatroom_link";
                addChatroomLink.text = "+";
                addChatroomLink.href = '';
                addChatroomLink.onclick = function() { return self.toggleAddChatroomForm(); };
      
                chatroomsDiv.appendChild(addChatroomLink);
        
                var chatroomsError = document.createElement("P");
                chatroomsError.id = 'add_chatroom_error';
                chatroomsError.style.display = 'none';
                chatroomsDiv.appendChild(chatroomsError);
        
                var addChatroomForm = document.createElement("FORM");
                addChatroomForm.id = 'add_chatroom_form';
                addChatroomForm.action = '';
                addChatroomForm.style.display = 'none';
                addChatroomForm.onsubmit = function() {
                    var addChatroomFormInput = document.getElementById('add_chatroom_form_input');
                    if(addChatroomFormInput.value){
                        self.sendChatroom({ name: addChatroomFormInput.value, user_id: self.user.user_id  })
                        addChatroomFormInput.value = "";
                    }
                    return false;
                };
        
                var addChatroomFormInput = document.createElement("INPUT");
                addChatroomFormInput.id = 'add_chatroom_form_input';
                addChatroomFormInput.type = 'text';
       
                addChatroomForm.appendChild(addChatroomFormInput); 
        
                var addChatroomFormButton = document.createElement("INPUT");
                addChatroomFormButton.type = "submit";
                addChatroomFormButton.value = 'Add';
        
                addChatroomForm.appendChild(addChatroomFormButton); 
        
                chatroomsDiv.appendChild(addChatroomForm);
            }
            
        }else{
            if(chatroomsDiv.style.display === 'none'){
                chatroomsDiv.style.display = 'block';
            }else{
                chatroomsDiv.style.display = 'none';
                self.setDisplay('.chatroom_chat', 'none');
            }
        }
        onlineusersDiv.style.display = 'none';
        self.setDisplay('#private_chat', 'none');
    
        return false;
    }
  
    this.toggleAddChatroomForm = function(){
        var addChatroomForm = document.getElementById('add_chatroom_form');
        var addChatroomLink = document.getElementById('add_chatroom_link');
        var chatroomsError = document.getElementById('add_chatroom_error');
        if(addChatroomForm.style.display === 'block'){
            addChatroomForm.style.display = 'none';
            addChatroomLink.text = "+";
            chatroomsError.text = "";
            chatroomsError.style.display = 'none';
        }else{
            addChatroomForm.style.display = 'block';
            addChatroomLink.text = "-";
        }
    
        return false;  
    }
  
    this.addChatroomToList = function(obj){
        var chatroomsList = document.getElementById('chatrooms_list');
    
        if(chatroomsList){
            var chatroomItem = document.createElement("LI");
            chatroomItem.id = obj.id;
        
            var chatroomItemLink = document.createElement("A");
            chatroomItemLink.text = obj.name;
            chatroomItemLink.href = '';
            chatroomItemLink.onclick = function() { return self.startChatroom(obj) };
      
            chatroomItem.appendChild(chatroomItemLink);
    
            chatroomsList.appendChild(chatroomItem); 
        }
    }
  
    this.startChatroom = function(chatroom){
        this.removeNotificationChatroomMessage(chatroom.id);
        self.setDisplay('#chatroom_chat', 'block');
        self.setDisplay('.chatroom_chat', 'none');
  
        var chatroomchatDiv = document.getElementById('chatroom_chat');
  
        if($('#chatroom_chat').find('#'+chatroom.id).length === 0){
            var chatroomchatBlock = document.createElement("DIV");
            chatroomchatBlock.id = chatroom.id;
            chatroomchatBlock.className = 'chatroom_chat';
  
            chatroomchatDiv.appendChild(chatroomchatBlock);
    
            var chatroomchatHeader = document.createElement("p");
            chatroomchatHeader.innerHTML = chatroom.name;
    
            chatroomchatBlock.appendChild(chatroomchatHeader);
    
            var chatroomchatMsgs = document.createElement("UL");
            chatroomchatMsgs.id = 'chatroom_chat_msgs_'+chatroom.id;
    
            chatroomchatBlock.appendChild(chatroomchatMsgs);
  
            var chatroomchatForm = document.createElement("FORM");
            chatroomchatForm.id = 'chatroom_chat_form_'+chatroom.id;
            chatroomchatForm.action = '';
  
            chatroomchatBlock.appendChild(chatroomchatForm);
    
            $('<textarea/>', {
                id: 'cc_msg_'+chatroom.id,
                keypress: function(event) {
                    if (event.which == 13) {
                        event.preventDefault();
                        $('#chatroom_chat_form_'+chatroom.id).submit();
                    }
                },
                click: function() { self.removeNotificationChatroomMessage(chatroom.id) }
            }).appendTo('#chatroom_chat_form_'+chatroom.id);
    
            $('#chatroom_chat_form_'+chatroom.id).submit(function(){
                if($('#cc_msg_'+chatroom.id).val()){
                    self.sendChatroomMsg({ chatroom_id: chatroom.id, message: $('#cc_msg_'+chatroom.id).val(), user_id: self.user.user_id, avatar: self.user.avatar, username: self.user.username });
                    $('#cc_msg_'+chatroom.id).val('');
                }
                return false;
            });
        }else{
            $('#chatroom_chat').find('#'+chatroom.id).show(); 
        }
  
        $('#chatroom_chat_msgs_'+chatroom.id).empty();
        this.getChatroomChatMsgs(chatroom.id);
        return false;  
    }
  
    this.switchChat = function(){
        if(this.open){
            this.open = false;
            self.closeChat();
            socket.emit('user_logout', self.user);
        }else{
            this.open = true;
            self.openChat();
            self.displayOnlineUsers();
        }
    
        self.user.available = this.open ? 1:0;
        self.updateUser();
    
        return false;
    }
  
    this.openChat = function(){
        var chat_container = document.getElementById(chat_container_id);
        var chatLink = document.getElementById('chat_link');
        var chatroomsLink = document.getElementById('chatrooms_link');
        var switchLink = document.getElementById('chat_switch_link');
    
        chat_container.style.width = '400px';
        switchLink.className = 'open_chat';
        chatLink.style.display = 'block';
        chatroomsLink.style.display = 'block';
  
        socket.emit('user_login', this.user);
    }
  
    this.closeChat = function(){
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
        $('#chatroom_chat').hide();
        switchLink.className = 'close_chat'; 
    }
  
    this.sendChatroom = function(obj){
        this.doPost('/chatroom', obj, function(data){ 
            if(data){
                socket.emit('add_chatroom_to_list', data);
                self.toggleAddChatroomForm();
                $('#add_chatroom_error').text("");
                $('#add_chatroom_error').hide();
            }else{
                $('#add_chatroom_error').text(obj.name+' already exists.');
                $('#add_chatroom_error').show();
            }
        });
    };
  
    this.getOnlineUsers = function(){
        this.doGet('/online_users/'+this.online_seconds, function(data){ 
            if(data){
                data = JSON.parse(data);
                var onlineusersList = document.getElementById('online_users_list'+self.user.user_id);
                for(i in data){
                    self.addOnlineUserToList(data[i]);
                }
            }
        });
    };
  
    this.addOnlineUserToList = function(theuser){
        if((theuser.user_id !== this.user.user_id) && ($('#online_users_list'+this.user.user_id).find('#'+theuser.user_id).length === 0)){
            var onlineusersList = document.getElementById('online_users_list'+this.user.user_id);
  
            if(onlineusersList){
                var onlineUserItem = document.createElement("LI");
                onlineUserItem.id = theuser.user_id;
        
                var onlineUserItemLink = document.createElement("A");
                onlineUserItemLink.text = theuser.username;
                onlineUserItemLink.href = '';
                onlineUserItemLink.onclick = function() { return self.startPrivateChat(theuser) };
      
                onlineUserItem.appendChild(onlineUserItemLink);
    
                onlineusersList.appendChild(onlineUserItem); 
      
                $('#online_users p').hide();
      
                $('#chat_link span').text(' ('+$('#online_users_list'+this.user.user_id+' li').length+')'); 
            }
        }
    }
  
    this.getChatrooms = function(){
        this.doGet('/chatrooms', function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addChatroomToList(data[i]);
                }
            }
        });
    };
  
    this.doPost = function(query_string, options, callback){
        $.post(chat_domain+query_string, options, function(data, textStatus, jqXHR ) {
            if(textStatus === 'success'){
                callback(data);
            }else{
                callback(null);
            }
        }); 
    };

    this.doGet = function(query_string, callback){
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }else{
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 ) {
                if(xmlhttp.status == 200){
                    callback(xmlhttp.responseText);
                }else {
                    callback(null);
                }
            }
        }

        xmlhttp.open("GET", chat_domain+query_string, true);
        xmlhttp.send();
    };
    
//    this.doPost = function(query_string, data, callback){
//        var xmlhttp;
//        if (window.XMLHttpRequest) {
//            xmlhttp = new XMLHttpRequest();
//        }else{
//            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//        }
//
//        xmlhttp.onreadystatechange = function() {
//            if (xmlhttp.readyState == 4 ) {
//                if(xmlhttp.status == 200){
//                    callback(xmlhttp.responseText);
//                }else {
//                    callback(null);
//                }
//            }
//        }
//
//        xmlhttp.open("POST", chat_domain+query_string, true);
//        
//        xmlhttp.send(JSON.stringify(data));
//    };
  
    this.startPrivateChat = function(the_user){
        this.removeNotificationOfMessage(the_user.user_id);
        this.getPrivateChat(the_user);
        return false;  
    }
  
    this.getPrivateChat = function(the_user){
        this.doGet('/private_chat/'+this.user.user_id+'/'+the_user.user_id, function(data){ 
            data = JSON.parse(data);
            self.showPrivateChat(data, the_user);
        });
    };
  
    this.showPrivateChat = function(private_chat, the_user){
    
        $('#private_chat').show();
        $('.private_chat').hide();
  
        var privatechatDiv = document.getElementById('private_chat');
  
        if($('#private_chat').find('#'+private_chat.id).length === 0){
            var privatechatBlock = document.createElement("DIV");
            privatechatBlock.id = private_chat.id;
            privatechatBlock.className = 'private_chat';
  
            privatechatDiv.appendChild(privatechatBlock);
    
            var privatechatHeader = document.createElement("p");
            privatechatHeader.innerHTML = the_user.username;
    
            privatechatBlock.appendChild(privatechatHeader);
    
            var privatechatMsgs = document.createElement("UL");
            privatechatMsgs.id = 'private_chat_msgs_'+private_chat.id;
    
            privatechatBlock.appendChild(privatechatMsgs);
  
            var privatechatForm = document.createElement("FORM");
            privatechatForm.id = 'private_chat_form_'+private_chat.id;
            privatechatForm.action = '';
  
            privatechatBlock.appendChild(privatechatForm);
    
            $('<textarea/>', {
                id: 'pc_msg_'+private_chat.id,
                keypress: function(event) {
                    if (event.which == 13) {
                        event.preventDefault();
                        $('#private_chat_form_'+private_chat.id).submit();
                    }
                },
                click: function() { self.removeNotificationOfMessage(the_user.user_id) }
            }).appendTo('#private_chat_form_'+private_chat.id);
    
            $('#private_chat_form_'+private_chat.id).submit(function(){
                if($('#pc_msg_'+private_chat.id).val()){
                    self.sendPrivateMsg({ private_chat_id: private_chat.id, message: $('#pc_msg_'+private_chat.id).val(), user_id: self.user.user_id, avatar: self.user.avatar, with_user_id: the_user.user_id, username: self.user.username });
                    $('#pc_msg_'+private_chat.id).val('');
                }
                return false;
            });
        }else{
            $('#private_chat').find('#'+private_chat.id).show(); 
        }
  
        $('#private_chat_msgs_'+private_chat.id).empty();
        this.getPrivateChatMsgs(private_chat.id);
    }
  
    this.sendPrivateMsg = function(obj){
        this.doPost('/private_msg', obj, function(data){ 
            socket.emit('add_msg_to_private_chat', data);
        });
    };
  
    this.sendChatroomMsg = function(obj){
        this.doPost('/chatroom_msg', obj, function(data){   
            socket.emit('add_msg_to_chatroom', data);
        });
    };
  
    this.getPrivateChatMsgs = function(private_chat_id){
        this.doGet('/private_msgs/'+private_chat_id, function(data){
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addMsgToPrivateChat(data[i]);
                }
                $('#private_chat_msgs_'+private_chat_id+' li').last().focus();
            }
        });
    };
  
    this.getChatroomChatMsgs = function(chatroom_id){
        this.doGet('/chatroom_msgs/'+chatroom_id, function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addMsgToChatroomChat(data[i]);
                }
                $('#chatroom_chat_msgs_'+chatroom_id+' li').last().focus();
            }
        });
    };
  
    this.addMsgToPrivateChat = function(obj){
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
    
    this.notifyUserOfMessage = function(obj){
        if($('#online_users_list'+obj.with_user_id).find('#'+obj.user_id).length !== 0){
            $('#online_users_list'+obj.with_user_id).find('#'+obj.user_id+' a').addClass('active');
        }
    }
    
    this.removeNotificationOfMessage = function(with_user_id){
        if($('#online_users_list'+this.user.user_id).find('#'+with_user_id).length !== 0){
            $('#online_users_list'+this.user.user_id).find('#'+with_user_id+' a').removeClass('active');
        }
    }
    
    this.notifyChatroomMessage = function(chatroom){
        if(chatroom.user_id !== this.user.user_id){
            if($('#chatrooms_list').find('#'+chatroom.chatroom_id).length !== 0){
                $('#chatrooms_list').find('#'+chatroom.chatroom_id+' a').addClass('active');
            }
        }
    }
    
    this.removeNotificationChatroomMessage = function(chatroom_id){
        if($('#chatrooms_list').find('#'+chatroom_id).length !== 0){
            $('#chatrooms_list').find('#'+chatroom_id+' a').removeClass('active');
        }
    }
  
    this.addMsgToChatroomChat = function(obj){
        var chatroomchatMsgs = document.getElementById('chatroom_chat_msgs_'+obj.chatroom_id);
        var last_tab_index = $('#chatroom_chat_msgs_'+obj.chatroom_id+' li').last().attr('tabindex');
    
        if(chatroomchatMsgs){
            var chatroomchatMsg = document.createElement("LI");
            chatroomchatMsg.tabIndex = ++last_tab_index;
      
            var chatroomchatImg = document.createElement("IMG");
            chatroomchatImg.src = obj.avatar;
            chatroomchatImg.onerror = function(){ chatroomchatImg.src = chat_domain+"/images/img-no-avatar.gif"; };
            chatroomchatMsg.appendChild(chatroomchatImg);
      
            var chatroomchatUsername = document.createElement("SPAN");
            chatroomchatUsername.innerHTML = obj.username;
            chatroomchatMsg.appendChild(chatroomchatUsername);
      
            var chatroomchatText = document.createElement("P");
            chatroomchatText.innerHTML = obj.message;
            chatroomchatMsg.appendChild(chatroomchatText);
    
            chatroomchatMsgs.appendChild(chatroomchatMsg);
      
            $('#chatroom_chat_msgs_'+obj.chatroom_id+' li').last().focus();
        }
    }
  
    this.removeOnlineUserFromList = function(theuser){
        if($('#online_users_list'+this.user.user_id).find('#'+theuser.user_id).length !== 0){
            $('#online_users_list'+this.user.user_id).find('#'+theuser.user_id).remove();
            $('#chat_link span').text(' ('+$('#online_users_list'+this.user.user_id+' li').length+')');
            if($('#online_users_list'+this.user.user_id+' li').length === 0){
                $('#online_users p').show();   
            }
        }
    }
}