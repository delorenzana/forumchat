function ChatUsers() {
    this.user_count = 0;
    this.users = [];
    this.private_chats_count = 0;
    this.private_chats = [];
    this.private_messages_count = 0;
    this.private_messages = [];
    this.chatroom_count = 0;
    this.chatrooms = [];
    this.chatroom_messages_count = 0;
    this.chatroom_messages = [];
    this.getUser = function(user_id){
        var found_users = this.users.filter(function(item){
            return item.user_id === user_id;
        });
        if(found_users.length === 1){
            return found_users[0];
        }
        return null;
    };
    this.addUser = function(user){
        user.user_id = parseInt(user.user_id);
        user.is_moderator = parseInt(user.is_moderator);
        user.last_online = new Date().getTime();
        
        this.user_count++;
        user.available = 0;
        this.users.push(user); 
        
        return user;
    };
    this.initUser = function(user, callback){
        user.user_id = parseInt(user.user_id);
    
        var existing_user = this.getUser(user.user_id);
      
        if(existing_user){
            existing_user.last_online = new Date().getTime();
            callback(false, existing_user);
        }else{
            var user = this.addUser(user);
            callback(false, user);
        }
    };
    this.updateUser = function(user, callback){
        user.user_id = parseInt(user.user_id);
        user.available = parseInt(user.available);
        
        var existing_user = this.getUser(user.user_id);
      
        if(existing_user){
            existing_user.last_online = new Date().getTime();
            existing_user.available = user.available;
            callback(false, existing_user);
        }else{
            callback(true);
        }
    };
    this.getOnlineUsers = function(online_seconds, callback){
        var found_users = this.users.filter(function(item){
            return item.available === 1;
        });
       
        if(found_users.length > 0){
            callback(false, found_users);
        }else{
            callback(true);
        }
    };
    this.getPrivateChat = function(private_chat){
        var found_private_chats = this.private_chats.filter(function(item){
            return (((item.user_id === private_chat.user_id) && (item.with_user_id === private_chat.with_user_id))
                       || ((item.user_id === private_chat.with_user_id) && (item.with_user_id === private_chat.user_id))
                       );
        });
        if(found_private_chats.length === 1){
            return found_private_chats[0];
        }
        return null;
    };
    this.addPrivateChat = function(private_chat){
        this.private_chats_count++;
        
        private_chat.id = this.private_chats_count;
        private_chat.user_id = parseInt(private_chat.user_id);
        private_chat.with_user_id = parseInt(private_chat.with_user_id);
        private_chat.total_messages = 0;
        private_chat.unread_messages = 0;
        private_chat.created_at = new Date().getTime();
       
        this.private_chats.push(private_chat); 
        
        return private_chat;
    };
    this.initPrivateChat = function(private_chat, callback){
        private_chat.user_id = parseInt(private_chat.user_id);
        private_chat.with_user_id = parseInt(private_chat.with_user_id);
    
        var existing_private_chat = this.getPrivateChat(private_chat);
      
        if(existing_private_chat){
            callback(false, existing_private_chat);
        }else{
            var private_chat = this.addPrivateChat(private_chat);
            callback(false, private_chat);
        }
    };
    this.addPrivateMessage = function(private_message, callback){
        this.private_messages_count++;
        
        private_message.id = this.private_messages_count;
        private_message.private_chat_id = parseInt(private_message.private_chat_id);
        private_message.user_id = parseInt(private_message.user_id);
        private_message.with_user_id = parseInt(private_message.with_user_id);
        private_message.created_at = new Date().getTime();
       
        this.private_messages.push(private_message);
        
        callback(private_message);
    };
    this.getPrivateMessages = function(private_chat_id, callback){
        private_chat_id = parseInt(private_chat_id);
        var found_messages = this.private_messages.filter(function(item){
            return item.private_chat_id === private_chat_id;
        });
       
        if(found_messages.length > 0){
            callback(false, found_messages);
        }else{
            callback(true);
        }
    };
    this.getChatroom = function(name){
        var found_chatrooms = this.chatrooms.filter(function(item){
            return item.name === name;
        });
        if(found_chatrooms.length === 1){
            return found_chatrooms[0];
        }
        return null;
    };
    this.addChatroom = function(chatroom, callback){
        var existing_chatroom = this.getChatroom(chatroom.name);
        
        if(existing_chatroom){
            callback(true);
        }else{
            this.chatroom_count++;
        
            chatroom.id = this.chatroom_count;
            chatroom.user_id = parseInt(chatroom.user_id);
            chatroom.created_at = new Date().getTime();
       
            this.chatrooms.push(chatroom);
        
            callback(false, chatroom);
        }
    };
    this.getChatrooms = function(callback){
        callback(this.chatrooms);
    };
    this.getChatroomMessages = function(chatroom_id, callback){
        chatroom_id = parseInt(chatroom_id);
        var found_messages = this.chatroom_messages.filter(function(item){
            return item.chatroom_id === chatroom_id;
        });
       
        if(found_messages.length > 0){
            callback(false, found_messages);
        }else{
            callback(true);
        }
    };
    this.addChatroomMessage = function(chatroom_message, callback){
        this.chatroom_messages_count++;
        
        chatroom_message.id = this.chatroom_messages_count;
        chatroom_message.chatroom_id = parseInt(chatroom_message.chatroom_id);
        chatroom_message.user_id = parseInt(chatroom_message.user_id);
        chatroom_message.created_at = new Date().getTime();
       
        this.chatroom_messages.push(chatroom_message);
        
        callback(chatroom_message);
    };
}

module.exports.ChatUsers = ChatUsers;

