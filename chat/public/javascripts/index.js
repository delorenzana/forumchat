var initChat = function(options){
    var chatbar = new ChatBar();
    chatbar.init(options); 
}

function ChatBar() {
    var self = this;
    this.chat_domain = null;
    this.socket = null;
    this.user = null;
    this.img_no_avatar = null;
    this.online_seconds;
    this.open = false;
    this.chatrooms_loaded = false;
    this.online_users_loaded = false;
    this.cookie_name = "frdmchat_token";
    this.init = function(options){
        this.online_seconds = options.online_seconds;
        this.img_no_avatar = options.img_no_avatar;
        this.chat_domain = options.chat_domain;
        this.chat_container_id = options.chat_container_id;
        delete options.online_seconds;
        delete options.img_no_avatar;
        delete options.chat_domain;
        delete options.chat_container_id;
        if(typeof io !== 'undefined'){
            this.socket = io(this.chat_domain);
            if(this.socket){
                this.setUser(options);
            }
        }
    }
  
    this.setUser = function(options){
        this.doPost('/init', options, function(data){ 
            self.user = data;
            self.displayBar();
            self.setListeners();
        });
    };
  
    this.updateUser = function(){
        this.doPost('/update', this.user, function(data){
            this.user = data;
        });
    };
  
    this.setListeners = function(){
        this.socket.on('user_login', function(user){
            self.addOnlineUserToList(user); 
        });
        this.socket.on('user_logout', function(user){
            self.removeOnlineUserFromList(user); 
        });
        this.socket.on('add_msg_to_private_chat', function(obj){
            self.addMsgToPrivateChat(obj);
            self.notifyUserOfMessage(obj);
        });
        this.socket.on('add_chatroom_to_list', function(obj){
            self.addChatroomToList(obj);
        });
        this.socket.on('add_msg_to_chatroom', function(obj){
            self.addMsgToChatroomChat(obj);
            self.notifyChatroomMessage(obj);
        });
    };
    
//    this.getCookie = function() {
//        var name = this.cookie_name;
//        var value = "; " + document.cookie;
//        var parts = value.split("; " + name + "=");
//        if (parts.length === 2){ 
//            return parts.pop().split(";").shift();
//        }
//        return document.cookie;
//    }
    
    this.template = function (templateHTML, data) {
        for(var x in data) {
            var torep = new RegExp('{{'+x+'}}', 'gi');
            if(torep) {
                templateHTML = templateHTML
                    .replace(torep,
                        data[x] == null ? '' : data[x]);
            }
        }
        return templateHTML;
    };
    
    this.getChatTemplate = function(chat_container){
        this.doGet('/chat/'+this.user.user_id+'/'+this.user.token, function(data){ 
            if(data){ 
                $("body").append(data);
                chat_container.innerHTML = $("#chatTpl").html();
                self.setHandlers();
            }
        });
    };
    
    this.setHandlers = function(){
        var switchLink = document.getElementById("chat_switch_link");
        switchLink.onclick = this.switchChat;
        
        var chatLink = document.getElementById("chat_link");
        chatLink.onclick = this.displayOnlineUsers;

        var chatTitle2 = document.getElementById("chat_title_2");
        chatTitle2.onclick = this.displayOnlineUsers;
        
        var chatroomsLink = document.getElementById("chatrooms_link");
        chatroomsLink.onclick = this.displayChatrooms;

        var chatTitle = document.getElementById("chat_title");
        chatTitle.onclick = this.displayChatrooms;
        
        if(self.user.is_moderator){
            var addChatroomLink = document.getElementById("add_chatroom_link");
            addChatroomLink.onclick = function() { return self.toggleAddChatroomForm(); };
            
            var addChatroomForm = document.getElementById("add_chatroom_form");
            addChatroomForm.onsubmit = function() {
                var addChatroomFormInput = document.getElementById('add_chatroom_form_input');
                    if(addChatroomFormInput.value){
                        self.sendChatroom({ name: addChatroomFormInput.value, user_id: self.user.user_id  })
                        addChatroomFormInput.value = "";
                    }
                    return false;
            };
        }else{
            document.getElementById("add_chatroom_link").remove();
        }
        
        if(this.user.available){
            this.displayOnlineUsers();
        }
        
        if(this.user.available){
            this.open = true;
            this.openChat();
            this.getOpenPrivateChats();
        }else{
            this.open = false;
            this.closeChat();    
        }
    }
  
    this.displayBar = function(){
        var chat_container = document.getElementById(this.chat_container_id);
    
        this.getChatTemplate(chat_container);
        
        return false;
    }
  
    this.displayOnlineUsers = function(){
        if(!self.online_users_loaded){
            var onlineUsersList = document.getElementById('online_users_list');
            self.setDisplay('#online_users', 'none');
            onlineUsersList.id = 'online_users_list'+self.user.user_id;
            this.getOnlineUsers();
            
            self.online_users_loaded = true;
        }else{
            if(self.getDisplay('#online_users') === 'none'){
                self.setDisplay('#online_users', 'block');
                self.setDisplay('#chat_link', 'none');
            }else{
                self.setDisplay('#online_users', 'none');
                self.setDisplay('#chat_link', 'block');
                //self.setDisplay('#private_chat', 'none');
            }
        }
        
        self.setDisplay('#chatrooms', 'none');
        self.setDisplay('.chatroom_chat', 'none');
    
        return false;
    }
    
    this.turnObjToArray = function(obj) {
        return [].map.call(obj, function(element) {
            return element;
        })
    };
    
    this.getDisplay = function(selector){
        var element = document.querySelector(selector);
        if(element){
            return element.style.display;
        }
        return null;
    };
    
    this.setDisplay = function(selector, display){
        var elements = this.turnObjToArray(document.querySelectorAll(selector));
        if(elements){
            for(i in elements){
                elements[i].style.display = display;
            }
        }
    };
    
    this.setClass = function(selector, className){
        var elements = this.turnObjToArray(document.querySelectorAll(selector));
        if(elements){
            for(i in elements){
                elements[i].className = className;
            }
        }
    };
    
    this.setLastFocus = function(selector){
        var elements = document.querySelectorAll(selector);
        if(elements.length > 1){
            var last = elements[elements.length-1];
            last.focus();
        }
    };
    
    this.scrollToLast = function(selector){
        var element = document.querySelector(selector);
        element.scrollTop = element.scrollHeight;
    };
    
    this.getLastTabIndex = function(selector){
        var elements = document.querySelectorAll(selector);
        return elements.length ? elements[elements.length-1].getAttribute('tabindex') : 0;
    };
  
    this.displayChatrooms = function(){
        if(self.getDisplay('#chatrooms') === 'none'){
            self.setDisplay('#chatrooms', 'block');
            if(!self.chatrooms_loaded){
                self.getChatrooms();
                self.chatrooms_loaded = true;
            }
        }else{
            self.setDisplay('#chatrooms', 'none');
            self.setDisplay('#chatroom_chat', 'none');
        }
        
        self.setDisplay('#online_users', 'none');
        self.setDisplay('#private_chat', 'none');
        self.setDisplay('#chat_link', 'block');
    
        return false;
    }
  
    this.toggleAddChatroomForm = function(){
        var addChatroomForm = document.getElementById('add_chatroom_form');
        var addChatroomFormInput = document.getElementById('add_chatroom_form_input');
        var addChatroomFormButton = document.querySelector('.add_btn');
        var chatroomsError = document.getElementById('add_chatroom_error');
        if(addChatroomForm.style.display === 'block'){
            addChatroomForm.style.display = 'none';
            addChatroomFormInput.style.display = 'none';
            addChatroomFormButton.style.display = 'none';
            chatroomsError.text = "";
            chatroomsError.style.display = 'none';
        }else{
            addChatroomForm.style.display = 'block';
            addChatroomFormInput.style.display = 'block';
            addChatroomFormButton.style.display = 'block';
        }
    
        return false;  
    }
  
    this.addChatroomToList = function(obj){
        var chatroomsList = document.querySelector('#chatrooms_list .chat_featured');
        var chatroomsListCount = document.querySelector('#chatrooms_list .chat_members');
    
        if(self.chatrooms_loaded && chatroomsList){
            var chatroomItem = document.createElement("LI");
            chatroomItem.id = 'chatroom_list_item_'+obj.id;
        
            var chatroomItemLink = document.createElement("A");
            chatroomItemLink.text = obj.name;
            chatroomItemLink.href = '';
            chatroomItemLink.onclick = function() { return self.startChatroom(obj) };
      
            chatroomItem.appendChild(chatroomItemLink);
    
            chatroomsList.appendChild(chatroomItem); 
            
            var chatroomUserCount = document.createElement("LI");
            chatroomUserCount.id = 'chatroom_count_'+obj.id;
            chatroomUserCount.innerHTML = "0";
            
            chatroomsListCount.appendChild(chatroomUserCount);
        }
    }
  
    this.startChatroom = function(chatroom){
        this.removeNotificationChatroomMessage(chatroom.id);
        self.setDisplay('#chatroom_chat', 'block');
        self.setDisplay('.chatroom_chat', 'none');
        self.setClass('.open_chatroom', 'active_chatroom');
  
        var chatroomchatDiv = document.getElementById('chatroom_chat');
  
        if(document.querySelectorAll('div#chatroom_'+chatroom.id).length === 0){
            
            var openChatroomSample = document.getElementById('open_chatroom_sample');
            
            var chatroomchatBlock = document.createElement("DIV");
            chatroomchatBlock.id = 'chatroom_'+chatroom.id;
            chatroomchatBlock.className = 'open_chatroom';
            
            chatroomchatBlock.innerHTML = openChatroomSample.innerHTML;
            
            chatroomchatDiv.appendChild(chatroomchatBlock);
            
            document.querySelector('div#chatroom_'+chatroom.id+' .chat_title a').onclick = function() { return false; };
            document.querySelector('div#chatroom_'+chatroom.id+' .chat_title p').textContent = chatroom.name;
            
            var chatroomchatMsgs = document.querySelector('div#chatroom_'+chatroom.id+' ul');
            chatroomchatMsgs.id = 'chatroom_chat_msgs_'+chatroom.id;
            
            var chatroomchatForm = document.querySelector('div#chatroom_'+chatroom.id+' .chat_textform');
            chatroomchatForm.id = 'chatroom_chat_form_'+chatroom.id;
            chatroomchatForm.onsubmit = function(){
                var chatroomchatFormInput = document.getElementById('cc_msg_'+chatroom.id);
                if(chatroomchatFormInput.value){
                    self.sendChatroomMsg({ chatroom_id: chatroom.id, message: chatroomchatFormInput.value, user_id: self.user.user_id, avatar: self.user.avatar, username: self.user.username });
                    chatroomchatFormInput.value = "";
                }
                return false;
            };
            
            var chatroomchatFormInput = document.querySelector('div#chatroom_'+chatroom.id+' .chat_textform .chat_textarea');
            chatroomchatFormInput.id = 'cc_msg_'+chatroom.id;
            chatroomchatFormInput.onkeypress = function(event) {
                if (event.which === 13) {
                    event.preventDefault();
                    chatroomchatForm.onsubmit();
                }
            };
            chatroomchatFormInput.onclick = function() { self.removeNotificationChatroomMessage(chatroom.id) };
            chatroomchatFormInput.focus();
            
            this.getChatroomChatMsgs(chatroom.id);
            
        }else{
            self.setDisplay('#chatroom_'+chatroom.id, 'block');
            self.setClass('div#chatroom_'+chatroom.id, 'open_chatroom');
        }
        
        return false;  
    }
  
    this.switchChat = function(){
        if(this.open){
            this.open = false;
            self.closeChat();
            self.socket.emit('user_logout', self.user);
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
        var chat_container = document.getElementById(this.chat_container_id);
        var chatLink = document.getElementById('chat_link');
        var chatroomsLink = document.getElementById('chatrooms_link');
        var switchLink = document.getElementById('chat_switch_link');
    
        chat_container.style.width = '400px';
        switchLink.className = 'open_chat';
        chatLink.style.display = 'block';
        chatroomsLink.style.display = 'block';
  
        this.socket.emit('user_login', this.user);
    }
  
    this.closeChat = function(){
        var chat_container = document.getElementById(this.chat_container_id);
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
        self.setDisplay('#private_chat', 'none');
        self.setDisplay('#chatroom_chat', 'none');
        switchLink.className = 'close_chat'; 
    }
  
    this.sendChatroom = function(obj){
        obj.token = this.user.token;
        this.doPost('/chatroom', obj, function(data){ 
            if(data){
                self.socket.emit('add_chatroom_to_list', data);
                self.toggleAddChatroomForm();
                document.getElementById('add_chatroom_error').innerHTML = "";
                self.setDisplay('#add_chatroom_error', 'none');
            }else{
                document.getElementById('add_chatroom_error').innerHTML = obj.name+" already exists.";
                self.setDisplay('#add_chatroom_error', 'block');
            }
        });
    };
  
    this.getOnlineUsers = function(){
        this.doGet('/online_users/'+this.user.user_id+'/'+this.user.token, function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addOnlineUserToList(data[i]);
                }
            }
        });
    };
  
    this.addOnlineUserToList = function(theuser){
        if((theuser.user_id !== this.user.user_id) && (document.querySelectorAll('#online_user_'+theuser.user_id).length === 0)){
            var onlineusersList = document.getElementById('online_users_list'+this.user.user_id);
  
            if(onlineusersList){
                var onlineUserItem = document.createElement("LI");
                onlineUserItem.id = 'online_user_'+theuser.user_id;
        
                var onlineUserItemLink = document.createElement("A");
                onlineUserItemLink.text = theuser.username;
                onlineUserItemLink.href = '';
                onlineUserItemLink.onclick = function() { return self.startPrivateChat(theuser) };
      
                onlineUserItem.appendChild(onlineUserItemLink);
    
                onlineusersList.appendChild(onlineUserItem); 
      
                self.setDisplay('#online_users p#no_active_user', 'none');
      
                document.querySelector('#chat_link p span').innerHTML = document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length; 
            }
        }
    }
    
    this.removeOnlineUserFromList = function(theuser){
        if(document.querySelectorAll('#online_users_list'+this.user.user_id+' #online_user_'+theuser.user_id).length !== 0){
            document.querySelector('#online_users_list'+this.user.user_id).removeChild(document.querySelector('#online_user_'+theuser.user_id));
            document.querySelector('#chat_link span').innerHTML = document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length;
            if(document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length === 0){
                self.setDisplay('#online_users p', 'block');
            }
        }
    }
  
    this.getChatrooms = function(){
        this.doGet('/chatrooms/'+this.user.user_id+'/'+this.user.token, function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addChatroomToList(data[i]);
                }
            }
        });
    };
    
    this.getOpenPrivateChats = function(){
        this.doGet('/private_chats/open/'+this.user.user_id+'/'+this.user.token, function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.showPrivateChat(data[i], { username: data[i].username, user_id: data[i].other_user_id });
                    self.togglePrivateChat(data[i].id);
                }
            }
        });
    };
  
    this.doPost = function(query_string, options, callback){
        $.post(this.chat_domain+query_string, options, function(data, textStatus, jqXHR ) {
            if(textStatus === 'success'){
                callback(data);
            }else{
                callback(null);
            }
        }); 
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
//        xmlhttp.open("POST", this.chat_domain+query_string, true);
//        console.log(JSON.stringify(data));
//        xmlhttp.send(JSON.stringify(data));
//    };

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

        xmlhttp.open("GET", this.chat_domain+query_string, true);
        xmlhttp.send();
    };
  
    this.startPrivateChat = function(the_user){
        this.removeNotificationOfMessage(the_user.user_id);
        this.getPrivateChat(the_user);
        return false;  
    }
  
    this.getPrivateChat = function(the_user){
        this.doGet('/private_chat/'+this.user.user_id+'/'+the_user.user_id+'/'+this.user.token, function(data){ 
            data = JSON.parse(data);
            self.showPrivateChat(data, the_user);
        });
    };
  
    this.showPrivateChat = function(private_chat, the_user){
    
        self.setDisplay('#private_chat', 'block');
        //self.setDisplay('.private_chat', 'none');
  
        var privatechatDiv = document.getElementById('private_chat');
  
        if(document.querySelectorAll('#private_chat_'+private_chat.id).length === 0){
            var privatechatSample = document.getElementById('private_chat_sample');
            
            var privatechatBlock = document.createElement("DIV");
            privatechatBlock.id = 'private_chat_'+private_chat.id;
            privatechatBlock.className = 'private_chat';
            privatechatBlock.innerHTML = privatechatSample.innerHTML;
  
            privatechatDiv.appendChild(privatechatBlock);
            
            var privatechatHeaderSample = document.getElementById('private_chat_header_sample');
            
            var privatechatHeaderBlock = document.createElement("DIV");
            privatechatHeaderBlock.id = 'private_chat_header_'+private_chat.id;
            privatechatHeaderBlock.className = 'private_chat_header';
            privatechatHeaderBlock.innerHTML = privatechatHeaderSample.innerHTML;
            privatechatHeaderBlock.style.display = 'none';
            
            privatechatDiv.appendChild(privatechatHeaderBlock);
            
            var privatechatHeaderBlockP = document.querySelector('#private_chat_header_'+private_chat.id+' p.username');
            privatechatHeaderBlockP.innerHTML = the_user.username;
            privatechatHeaderBlockP.onclick = function() { return self.togglePrivateChatHeader(private_chat.id); };
    
            var privatechatHeader = document.querySelector('#private_chat_'+private_chat.id+' p.username');
            privatechatHeader.innerHTML = the_user.username;
            privatechatHeader.onclick = function() { return self.togglePrivateChat(private_chat.id); };
            
            var privatechatClose = document.querySelector('#private_chat_'+private_chat.id+' a.close_chat');
            privatechatClose.onclick = function() { return self.removePrivateChat(private_chat); };
            
            var privatechatHeaderClose = document.querySelector('#private_chat_header_'+private_chat.id+' a.close_chat');
            privatechatHeaderClose.onclick = function() { return self.removePrivateChat(private_chat); };
    
            var privatechatMsgs = document.querySelector('#private_chat_'+private_chat.id+' ul');
            privatechatMsgs.id = 'private_chat_msgs_'+private_chat.id;
            privatechatMsgs.style.display = 'block';
  
            var privatechatForm = document.querySelector('#private_chat_'+private_chat.id+' form');
            privatechatForm.id = 'private_chat_form_'+private_chat.id;
            privatechatForm.style.display = 'block';
            privatechatForm.onsubmit = function(){
                var privatechatFormInput = document.getElementById('pc_msg_'+private_chat.id);
                if(privatechatFormInput.value){
                    self.sendPrivateMsg({ private_chat_id: private_chat.id, message: privatechatFormInput.value, user_id: self.user.user_id, avatar: self.user.avatar, with_user_id: the_user.user_id, username: self.user.username });
                    privatechatFormInput.value = "";
                }
                return false;
            };
            
            var privatechatFormInput = document.querySelector('#private_chat_'+private_chat.id+' form textarea');
            privatechatFormInput.id = 'pc_msg_'+private_chat.id;
            privatechatFormInput.onkeypress = function(event) {
                if (event.which === 13) {
                    event.preventDefault();
                    privatechatForm.onsubmit();
                }
            };
            privatechatFormInput.onclick = function() { self.removeNotificationOfMessage(the_user.user_id) };
            privatechatFormInput.focus();
            
            this.getPrivateChatMsgs(private_chat.id);
        }
        
        self.setDisplay('#private_chat_'+private_chat.id, 'block');
        self.setDisplay('#private_chat_header_'+private_chat.id, 'none');
        
    }
    
    this.togglePrivateChat = function(id){
        if(document.querySelector('#private_chat_'+id).style.display === 'block'){
            document.querySelector('#private_chat_'+id).style.display = 'none';
            document.querySelector('#private_chat_header_'+id).style.display = 'block';
        }else{
            document.querySelector('#private_chat_'+id).style.display = 'block';
            document.querySelector('#private_chat_header_'+id).style.display = 'none';
        }
    
        return false;  
    }
    
    this.togglePrivateChatHeader = function(id){
        if(document.querySelector('#private_chat_header_'+id).style.display === 'block'){
            document.querySelector('#private_chat_header_'+id).style.display = 'none';
            document.querySelector('#private_chat_'+id).style.display = 'block';
        }else{
            document.querySelector('#private_chat_header_'+id).style.display = 'block';
            document.querySelector('#private_chat_'+id).style.display = 'none';
        }
    
        return false;  
    }
    
    this.removePrivateChat = function(private_chat){
        document.querySelector('#private_chat_'+private_chat.id).remove();
        document.querySelector('#private_chat_header_'+private_chat.id).remove();
        self.closePrivateChat(private_chat);
       
        return false;  
    }
  
    this.sendPrivateMsg = function(obj){
        obj.token = this.user.token;
        this.doPost('/private_msg', obj, function(data){
            if(data){
                self.socket.emit('add_msg_to_private_chat', data);
            }
        });
    };
  
    this.sendChatroomMsg = function(obj){
        obj.token = this.user.token;
        this.doPost('/chatroom_msg', obj, function(data){   
            if(data){
                self.socket.emit('add_msg_to_chatroom', data);
            }
        });
    };
  
    this.getPrivateChatMsgs = function(private_chat_id){
        this.doGet('/private_msgs/'+private_chat_id+'/'+this.user.user_id+'/'+this.user.token, function(data){
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addMsgToPrivateChat(data[i]);
                }
                //self.setLastFocus('#private_chat_msgs_'+private_chat_id+' li');
                self.scrollToLast('#private_chat_msgs_'+private_chat_id);
                
            }
        });
    };
    
    this.closePrivateChat = function(obj){
        obj.token = this.user.token;
        this.doPost('/private_chat/close', obj, function(data){
            if(data){
                // nothing
            }
        });
    };
  
    this.getChatroomChatMsgs = function(chatroom_id){
        this.doGet('/chatroom_msgs/'+chatroom_id+'/'+this.user.user_id+'/'+this.user.token, function(data){ 
            if(data){
                data = JSON.parse(data);
                for(i in data){
                    self.addMsgToChatroomChat(data[i]);
                }
                
                //self.setLastFocus('#chatroom_chat_msgs_'+chatroom_id+' li');
                self.scrollToLast('#chatroom_chat_msgs_'+chatroom_id);
            }
        });
    };
  
    this.addMsgToPrivateChat = function(obj){
        var privatechatMsgs = document.getElementById('private_chat_msgs_'+obj.private_chat_id);
        var last_tab_index = this.getLastTabIndex('#private_chat_msgs_'+obj.private_chat_id+' li');
        var lastChild = null;
        if(last_tab_index){
            var lastChild = privatechatMsgs.lastChild;
        }
        
        if(privatechatMsgs){
            
            if(lastChild && (lastChild.querySelector('span').innerHTML === obj.username)){
                
               var privatechatText = document.createElement("P");
                privatechatText.innerHTML = obj.message;
                lastChild.appendChild(privatechatText);
                
            }else{
                var privatechatMsg = document.createElement("LI");
                privatechatMsg.tabIndex = ++last_tab_index;
      
                var privatechatImg = document.createElement("IMG");
                privatechatImg.src = obj.avatar;
                privatechatImg.onerror = function(){ privatechatImg.src = self.img_no_avatar; };
                privatechatMsg.appendChild(privatechatImg);
      
                var privatechatUsername = document.createElement("SPAN");
                privatechatUsername.innerHTML = obj.username;
                privatechatMsg.appendChild(privatechatUsername);
      
                var privatechatText = document.createElement("P");
                privatechatText.innerHTML = obj.message;
                privatechatMsg.appendChild(privatechatText);
    
                privatechatMsgs.appendChild(privatechatMsg);
            }
      
            //self.setLastFocus('#private_chat_msgs_'+obj.private_chat_id+' li');
            self.scrollToLast('#private_chat_msgs_'+obj.private_chat_id);
        }
    }
    
    this.notifyUserOfMessage = function(obj){
        if(document.querySelectorAll('#online_users_list'+obj.with_user_id+' #online_user_'+obj.user_id).length !== 0){
            document.querySelector('#online_users_list'+obj.with_user_id+' #online_user_'+obj.user_id+' a').setAttribute('class', 'active');
        }
    }
    
    this.removeNotificationOfMessage = function(with_user_id){
        if(document.querySelectorAll('#online_users_list'+this.user.user_id+' #online_user_'+with_user_id).length !== 0){
            document.querySelector('#online_users_list'+this.user.user_id+' #online_user_'+with_user_id+' a').setAttribute('class', '');
        }
    }
    
    this.notifyChatroomMessage = function(chatroom){
        if(chatroom.user_id !== this.user.user_id){
            if(document.querySelectorAll('#chatrooms_list #chatroom_'+chatroom.chatroom_id).length !== 0){
                document.querySelector('#chatrooms_list #chatroom_'+chatroom.chatroom_id+' a').setAttribute('class', 'active');
            }
        }
    }
    
    this.removeNotificationChatroomMessage = function(chatroom_id){
        if(document.querySelectorAll('#chatrooms_list #chatroom_'+chatroom_id).length !== 0){
            document.querySelector('#chatrooms_list #chatroom_'+chatroom_id+' a').setAttribute('class', '');
        }
    }
  
    this.addMsgToChatroomChat = function(obj){
        var chatroomchatMsgs = document.getElementById('chatroom_chat_msgs_'+obj.chatroom_id);
        var last_tab_index = this.getLastTabIndex('#chatroom_chat_msgs_'+obj.chatroom_id+' li');
    
        if(chatroomchatMsgs){
            var chatroomchatMsg = document.createElement("LI");
            chatroomchatMsg.tabIndex = ++last_tab_index;
      
            var chatroomchatImg = document.createElement("IMG");
            chatroomchatImg.src = obj.avatar;
            chatroomchatImg.onerror = function(){ chatroomchatImg.src = self.img_no_avatar; };
            chatroomchatMsg.appendChild(chatroomchatImg);
      
            var chatroomchatUsername = document.createElement("SPAN");
            chatroomchatUsername.innerHTML = obj.username;
            chatroomchatMsg.appendChild(chatroomchatUsername);
      
            var chatroomchatText = document.createElement("P");
            chatroomchatText.innerHTML = obj.message;
            chatroomchatMsg.appendChild(chatroomchatText);
    
            chatroomchatMsgs.appendChild(chatroomchatMsg);
     
            //this.setLastFocus('#chatroom_chat_msgs_'+obj.chatroom_id+' li');
            self.scrollToLast('#chatroom_chat_msgs_'+obj.chatroom_id);
        }
    }
}