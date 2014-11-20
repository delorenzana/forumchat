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
    
        //chat_container.setAttribute("style","display:block");
    
        var chatBox = document.createElement("DIV");
        chatBox.setAttribute("id","chatbox");
      
        chat_container.appendChild(chatBox);
        
        // chat bar
    
        var chatbarDiv = document.createElement("DIV");
        chatbarDiv.setAttribute("id","chat_bar");
      
        chatBox.appendChild(chatbarDiv);
    
        // chat link
    
        var chatLink = document.createElement("A");
        chatLink.id = 'chat_link';
        chatLink.href = '';
        chatLink.onclick = this.displayOnlineUsers;
        
        var outerChatDiv = document.createElement("DIV");
        outerChatDiv.setAttribute("id","outer_chat_link");
        outerChatDiv.setAttribute("class","outer_box");
        
        chatLink.appendChild(outerChatDiv);
        
        var chatLinkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        chatLinkSvg.setAttribute("version","1.1");
        chatLinkSvg.setAttribute("id","Layer_1");
        chatLinkSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        chatLinkSvg.setAttribute("x","0px");
        chatLinkSvg.setAttribute("y","0px");
        chatLinkSvg.setAttribute("width","25px");
        chatLinkSvg.setAttribute("height","20px");
        chatLinkSvg.setAttribute("viewBox","0 0 9 12");
        chatLinkSvg.setAttribute("enable-background","new 0 0 9 12");
        chatLinkSvg.setAttribute("xml:space","preserve");
        
        var chatLinkSvgP1 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatLinkSvgP1.setAttribute("fill","#212121");
        chatLinkSvgP1.setAttribute("d","M4,8.329C3.833,8.256,3.374,8.133,3.319,7.924C3.232,7.593,3.562,7.342,3.708,7.081 \
              c0.155-0.274,0.283-0.646,0.308-0.957c0.09-1.113-0.593-1.765-1.572-1.653C1.731,4.553,1.306,5.084,1.26,5.769 \
              c-0.047,0.696,0.212,1.21,0.486,1.588c0.12,0.165,0.246,0.271,0.227,0.471C1.951,8.062,1.7,8.127,1.52,8.199 \
              C1.307,8.285,1.077,8.414,0.969,8.475C0.474,8.751-0.207,9.262,0.2,9.914c0.274,0.438,0.832,0.523,1.303,0.566 \
              c0.658,0.062,1.319,0.119,1.979,0.066c0.5-0.04,1.276-0.098,1.601-0.547c0.132-0.183,0.151-0.555,0.083-0.764 \
              C5.018,8.793,4.423,8.515,4,8.329z");
        
        var chatLinkSvgP2 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatLinkSvgP2.setAttribute("fill","#010101");
        chatLinkSvgP2.setAttribute("d", "M5.638,3.478c-0.189,0-0.343,0.153-0.343,0.342s0.153,0.343,0.343,0.343c0.188,0,0.342-0.154,0.342-0.343 \
              S5.826,3.478,5.638,3.478z M5.638,3.956c-0.075,0-0.135-0.061-0.135-0.135c0-0.074,0.06-0.135,0.135-0.135 \
              c0.074,0,0.135,0.061,0.135,0.135C5.772,3.895,5.712,3.956,5.638,3.956z");
              
        var chatLinkSvgP3 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatLinkSvgP3.setAttribute("fill","#010101");
        chatLinkSvgP3.setAttribute("d", "M7.78,3.478c-0.189,0-0.343,0.153-0.343,0.342S7.591,4.163,7.78,4.163c0.188,0,0.343-0.154,0.343-0.343 \
              S7.969,3.478,7.78,3.478z M7.78,3.956c-0.075,0-0.135-0.061-0.135-0.135c0-0.074,0.06-0.135,0.135-0.135 \
              c0.074,0,0.136,0.061,0.136,0.135C7.916,3.895,7.854,3.956,7.78,3.956z");
        
        var chatLinkSvgP4 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatLinkSvgP4.setAttribute("fill","#010101");
        chatLinkSvgP4.setAttribute("d", "M6.709,3.478c-0.189,0-0.343,0.153-0.343,0.342S6.52,4.163,6.709,4.163c0.188,0,0.343-0.154,0.343-0.343 \
              S6.897,3.478,6.709,3.478z M6.709,3.956c-0.075,0-0.135-0.061-0.135-0.135c0-0.074,0.06-0.135,0.135-0.135 \
              c0.074,0,0.135,0.061,0.135,0.135C6.844,3.895,6.783,3.956,6.709,3.956z");
        
        var chatLinkSvgP5 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatLinkSvgP5.setAttribute("fill","#212120");
        chatLinkSvgP5.setAttribute("d", "M6.709,2.286c-1.232,0-2.235,0.717-2.235,1.598c0,0.393,0.197,0.765,0.559,1.057l-0.502,0.9l1.092-0.56 \
              C5.955,5.413,6.33,5.483,6.709,5.483c1.232,0,2.234-0.717,2.234-1.599C8.943,3.002,7.94,2.286,6.709,2.286z M6.709,5.275 \
              c-0.369,0-0.732-0.07-1.052-0.204L5.613,5.052L5.045,5.343l0.257-0.458L5.229,4.83C4.875,4.571,4.681,4.235,4.681,3.885 \
              c0-0.768,0.91-1.392,2.028-1.392c1.117,0,2.026,0.625,2.027,1.392C8.736,4.652,7.827,5.275,6.709,5.275z");
        
        chatLinkSvg.appendChild(chatLinkSvgP1);
        chatLinkSvg.appendChild(chatLinkSvgP2);
        chatLinkSvg.appendChild(chatLinkSvgP3);
        chatLinkSvg.appendChild(chatLinkSvgP4);
        chatLinkSvg.appendChild(chatLinkSvgP5);
        
        outerChatDiv.appendChild(chatLinkSvg);
        
        var chatP = document.createElement("P");
        chatP.innerHTML = "Chat";

        outerChatDiv.appendChild(chatP);
        
        chatbarDiv.appendChild(chatLink);
      
        // online users count
    
        var chatLinkCount = document.createElement("SPAN");
        chatLinkCount.innerHTML = "(0)";
      
        chatP.appendChild(chatLinkCount);
        
        // chatrooms link
    
        var chatroomsLink = document.createElement("A");
        chatroomsLink.id = 'chatrooms_link';
        chatroomsLink.href = '';
        chatroomsLink.onclick = this.displayChatrooms;
        
        var outerChatroomsDiv = document.createElement("DIV");
        outerChatroomsDiv.setAttribute("id","outer_chatrooms");
        outerChatroomsDiv.setAttribute("class","outer_box");
        
        var chatroomsLinkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        chatroomsLinkSvg.setAttribute("version","1.1");
        chatroomsLinkSvg.setAttribute("id","Layer_1");
        chatroomsLinkSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        chatroomsLinkSvg.setAttribute("x","0px");
        chatroomsLinkSvg.setAttribute("y","0px");
        chatroomsLinkSvg.setAttribute("width","18px");
        chatroomsLinkSvg.setAttribute("height","19px");
        chatroomsLinkSvg.setAttribute("viewBox","0 0 15 15");
        chatroomsLinkSvg.setAttribute("enable-background","new 0 0 15 15");
        chatroomsLinkSvg.setAttribute("xml:space","preserve");
        
        var chatroomsLinkSvgP1 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatroomsLinkSvgP1.setAttribute("fill","#010101");
        chatroomsLinkSvgP1.setAttribute("d","M5.857,8.166C5.833,8.153,5.809,8.14,5.79,8.127C5.667,8.05,5.56,7.803,5.546,7.638 \
              C5.543,7.604,5.541,7.538,5.541,7.513c0.02-0.032,0.065-0.096,0.093-0.131C5.708,7.29,5.788,7.171,5.868,7.038 \
              C5.8,6.942,5.732,6.833,5.665,6.714c-0.09,0.168-0.186,0.317-0.27,0.422C5.381,7.154,5.257,7.31,5.233,7.397 \
              C5.209,7.485,5.224,7.653,5.225,7.674c0.019,0.223,0.133,0.519,0.312,0.697c0.108-0.056,0.196-0.101,0.255-0.142 \
              C5.813,8.217,5.835,8.193,5.857,8.166z M2.118,12.587c-1.281-0.152-1.644-0.411-1.728-0.495c0.019-0.3,0.07-1.714,0.154-1.982 \
              c0.111-0.355,0.241-0.509,0.413-0.64c0.086-0.065,0.549-0.263,0.958-0.438c0.52-0.22,1.058-0.449,1.268-0.586 \
              c0.233-0.149,0.383-0.509,0.406-0.772c0-0.009,0.016-0.187-0.008-0.277C3.568,7.348,3.545,7.3,3.513,7.25L3.499,7.232 \
              C3.479,7.208,3.423,7.139,3.418,7.135C3.223,6.891,2.962,6.42,2.855,5.964C2.707,5.333,2.589,4.057,3.092,3.288 \
              C3.365,2.867,3.8,2.644,4.381,2.622l0.02-0.001l0.032,0.001C4.714,2.633,4.96,2.692,5.17,2.795C5.199,2.677,5.232,2.56,5.273,2.447 \
              C5.073,2.35,4.849,2.29,4.599,2.266V2.25L4.401,2.252L4.377,2.251L4.215,2.254v0.012C3.607,2.324,3.142,2.593,2.833,3.069 \
              C2.125,4.155,2.499,5.868,2.543,6.06c0.122,0.517,0.407,1.038,0.641,1.327c0.012,0.015,0.053,0.065,0.077,0.092 \
              c0.007,0.011,0.01,0.018,0.01,0.018c0.002,0.027,0,0.103-0.002,0.141C3.254,7.803,3.146,8.05,3.024,8.127 \
              C2.835,8.249,2.287,8.481,1.803,8.69C1.241,8.928,0.891,9.078,0.779,9.164c-0.262,0.2-0.418,0.437-0.539,0.822 \
              c-0.125,0.4-0.174,2.114-0.175,2.154L0.063,12.18l0.011,0.033c0.047,0.15,0.333,0.545,2.018,0.742 \
              C2.097,12.874,2.105,12.743,2.118,12.587z M6.243,6.978c0.093,0.117,0.161,0.211,0.188,0.298C6.539,7.622,6.223,8.375,5.952,8.55 \
              c-0.263,0.171-0.938,0.458-1.59,0.735c-0.517,0.22-1.103,0.469-1.216,0.554c-0.224,0.17-0.392,0.368-0.536,0.831 \
              c-0.123,0.391-0.184,2.096-0.197,2.335c0.098,0.109,0.872,0.787,5.101,0.787c4.114,0,4.963-0.653,5.1-0.796 \
              c-0.016-0.259-0.076-1.941-0.197-2.326c-0.145-0.463-0.313-0.661-0.535-0.831c-0.113-0.085-0.699-0.334-1.217-0.554 \
              c-0.65-0.277-1.326-0.564-1.588-0.735C8.768,8.353,8.58,7.587,8.588,7.332C8.59,7.254,8.617,7.184,8.787,6.973 \
              c0.252-0.314,0.584-0.914,0.721-1.496C9.695,4.673,9.844,3.05,9.203,2.066C8.85,1.524,8.291,1.236,7.548,1.208L7.503,1.207 \
              L7.479,1.208C6.733,1.236,6.176,1.524,5.823,2.066C5.181,3.05,5.33,4.673,5.519,5.477c0.137,0.582,0.468,1.182,0.718,1.495 \
               M9.207,8.127c0.061,0.039,0.148,0.088,0.256,0.141c0.178-0.177,0.293-0.472,0.313-0.696c0.002-0.019,0.016-0.189-0.008-0.277 \
              c-0.023-0.086-0.146-0.244-0.16-0.262C9.521,6.928,9.426,6.781,9.336,6.612C9.268,6.73,9.199,6.837,9.135,6.935 \
              c0.076,0.134,0.158,0.253,0.232,0.346C9.395,7.314,9.439,7.378,9.459,7.41c0,0.026-0.002,0.092-0.004,0.125 \
              C9.441,7.702,9.332,7.946,9.209,8.024C9.191,8.038,9.168,8.052,9.145,8.065C9.166,8.091,9.188,8.114,9.207,8.127z M12.908,12.854 \
              c1.686-0.198,1.973-0.596,2.02-0.745l0.01-0.032l-0.002-0.04C14.934,12,14.885,10.284,14.76,9.884 \
              c-0.119-0.387-0.277-0.625-0.537-0.823c-0.111-0.085-0.463-0.236-1.025-0.474c-0.482-0.208-1.033-0.44-1.223-0.563 \
              c-0.121-0.078-0.229-0.323-0.242-0.49c-0.004-0.037-0.006-0.113-0.004-0.139c0.002,0,0.006-0.008,0.012-0.019 \
              c0.023-0.028,0.066-0.077,0.076-0.092c0.232-0.291,0.52-0.811,0.641-1.329c0.043-0.191,0.418-1.903-0.291-2.99 \
              c-0.307-0.475-0.771-0.745-1.379-0.803V2.151l-0.164-0.002L10.6,2.151L10.4,2.148v0.015c-0.25,0.024-0.473,0.085-0.674,0.18 \
              c0.041,0.115,0.074,0.23,0.105,0.35c0.211-0.105,0.453-0.163,0.734-0.173L10.6,2.519l0.02,0.002 \
              c0.582,0.021,1.014,0.244,1.289,0.666c0.502,0.768,0.387,2.043,0.236,2.676c-0.107,0.455-0.365,0.926-0.564,1.17 \
              c-0.004,0.006-0.061,0.074-0.08,0.099l-0.014,0.017c-0.031,0.047-0.053,0.098-0.066,0.146c-0.025,0.089-0.008,0.27-0.008,0.277 \
              c0.023,0.263,0.17,0.622,0.406,0.773c0.209,0.135,0.746,0.365,1.266,0.588c0.408,0.172,0.871,0.368,0.959,0.436 \
              c0.174,0.129,0.301,0.282,0.414,0.638c0.084,0.269,0.137,1.683,0.152,1.983c-0.082,0.083-0.445,0.341-1.727,0.494 \
              C12.895,12.64,12.904,12.77,12.908,12.854z");
        
        var chatroomsLinkSvgP2 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatroomsLinkSvgP2.setAttribute("fill","#3D82C4");
        chatroomsLinkSvgP2.setAttribute("d", "M8.215,7.099L8.143,6.614c0.303-0.246,0.599-0.712,0.733-1.586c0.246-0.497,0-0.8,0-0.8V3.479 \
              C8.873,3.459,8.867,3.443,8.864,3.424C8.85,3.199,8.821,2.966,8.761,2.753C8.554,2.495,8.222,2.096,7.408,2.057 \
              C6.843,2.033,6.279,2.263,6.041,2.474C5.93,2.675,5.86,2.923,5.816,3.174C5.791,3.257,5.767,3.343,5.749,3.44v0.747 \
              c0,0-0.246,0.305,0,0.803c0.131,0.844,0.414,1.307,0.708,1.562l-0.04,0.522C6.233,7.186,5.677,7.521,5.122,7.886 \
              C4.487,7.505,3.796,7.217,3.796,7.217L3.732,6.786c0.229-0.188,0.456-0.544,0.559-1.21c0.075-0.151,0.088-0.388,0.077-0.56 \
              C4.39,4.795,4.432,4.188,4.299,3.707c-0.168-0.21-0.44-0.534-1.101-0.566c-0.46-0.021-0.92,0.167-1.114,0.339 \
              C1.859,3.888,1.838,4.524,1.851,4.883c-0.032,0.174-0.045,0.46,0.055,0.662c0.1,0.645,0.316,0.996,0.54,1.19L2.409,7.217 \
              c0,0-1.557,0.852-1.9,1.23c-0.32,0.351-0.593,1.392-0.354,1.831c0.787,0.469,1.786,0.792,2.839,0.853 \
              c-0.104-0.661,0.204-1.696,0.56-2.09c0.122-0.132,0.364-0.315,0.649-0.506C4.074,8.635,3.966,8.727,3.899,8.8 \
              c-0.419,0.461-0.777,1.827-0.464,2.404c2.15,1.283,5.503,1.737,8.201-0.053c0.195-0.439-0.174-1.523-0.382-1.957 \
              C10.781,8.355,9.048,7.308,8.215,7.099z");
              
        var chatroomsLinkSvgP3 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        chatroomsLinkSvgP3.setAttribute("fill","#3D82C4");
        chatroomsLinkSvgP3.setAttribute("d", "M14.556,8.509c-0.345-0.38-1.901-1.231-1.901-1.231l-0.037-0.482c0.224-0.192,0.44-0.544,0.541-1.189 \
              c0.099-0.203,0.086-0.489,0.054-0.663c0.013-0.359-0.008-0.995-0.232-1.403c-0.194-0.172-0.654-0.36-1.116-0.34 \
              c-0.659,0.033-0.932,0.356-1.099,0.565c-0.133,0.483-0.091,1.089-0.07,1.311c-0.01,0.171,0.003,0.409,0.078,0.56 \
              c0.103,0.666,0.329,1.021,0.559,1.21l-0.063,0.431c0,0-0.737,0.309-1.385,0.706c0.614,0.363,1.373,0.843,1.627,1.119 \
              c0.355,0.393,0.663,1.429,0.56,2.088c1.054-0.059,2.053-0.381,2.839-0.853C15.148,9.901,14.874,8.861,14.556,8.509z");
        
        chatroomsLinkSvg.appendChild(chatroomsLinkSvgP1);
        chatroomsLinkSvg.appendChild(chatroomsLinkSvgP2);
        chatroomsLinkSvg.appendChild(chatroomsLinkSvgP3);
        
        outerChatroomsDiv.appendChild(chatroomsLinkSvg);
         
        chatroomsLink.appendChild(outerChatroomsDiv);
      
        chatbarDiv.appendChild(chatroomsLink);
    
        // switch link
    
        var switchLink = document.createElement("A");
        switchLink.id = 'chat_switch_link';
        switchLink.className = this.user.available ? 'open_chat' : 'close_chat';
        switchLink.href = '';
        switchLink.onclick = this.switchChat;
        
        var outerSwitchDiv = document.createElement("DIV");
        outerSwitchDiv.setAttribute("id","outer_chat_switch_link");
        outerSwitchDiv.setAttribute("class","outer_box");
        
        chatLink.appendChild(outerChatDiv);
        
        var switchLinkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        switchLinkSvg.setAttribute("version","1.1");
        switchLinkSvg.setAttribute("id","Layer_1");
        switchLinkSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        switchLinkSvg.setAttribute("x","0px");
        switchLinkSvg.setAttribute("y","0px");
        switchLinkSvg.setAttribute("width","20.984px");
        switchLinkSvg.setAttribute("height","8px");
        switchLinkSvg.setAttribute("viewBox","-3.984 0 20.984 8");
        switchLinkSvg.setAttribute("enable-background","new -3.984 0 20.984 8");
        switchLinkSvg.setAttribute("xml:space","preserve");
        
        var switchLinkSvgG1 = document.createElement("G");
        switchLinkSvgG1.setAttribute("id","Layer_2");
        
        var switchLinkSvgG1P1 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        switchLinkSvgG1P1.setAttribute("fill","#EF5451");
        switchLinkSvgG1P1.setAttribute("d","M10.063,6.941c0,0-2.987-2.59-0.119-5.883H2.207c0,0-3.084-0.167-3.189,2.942 \
		c-0.105,3.109,2.504,2.921,3.27,3.031C3.053,7.141,10.063,6.941,10.063,6.941z");
        
        var switchLinkSvgG1P2 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        switchLinkSvgG1P2.setAttribute("fill","#49B74A");
        switchLinkSvgG1P2.setAttribute("d","M15.079,0.672");
        
        switchLinkSvgG1.appendChild(switchLinkSvgG1P1);
        switchLinkSvgG1.appendChild(switchLinkSvgG1P2);
        
        var switchLinkSvgP1 = document.createElementNS("http://www.w3.org/2000/svg","path");  
        switchLinkSvgP1.setAttribute("fill","#010101");
        switchLinkSvgP1.setAttribute("d","M2.208,7.947h10.025c0.906,0,1.742-0.278,2.431-0.741C14.756,7.145,14.839,7.068,14.926,7 \
	c0.107-0.084,0.217-0.166,0.315-0.26c0.089-0.086,0.163-0.184,0.243-0.277c0.09-0.102,0.182-0.201,0.259-0.313 \
	c0.043-0.063,0.075-0.133,0.114-0.197c0.096-0.158,0.189-0.316,0.265-0.486c0.003-0.009,0.005-0.018,0.008-0.027 \
	c0.188-0.446,0.3-0.93,0.3-1.439c0-0.008-0.002-0.016-0.002-0.025c0-0.008,0.002-0.017,0.002-0.025c0-2.148-1.748-3.896-3.896-3.896 \
	c-0.051,0-0.098,0.013-0.146,0.015c-0.052-0.002-0.102-0.015-0.152-0.015H2.209c-2.314,0-4.194,1.77-4.194,3.947 \
	C-1.987,6.176-0.107,7.947,2.208,7.947z M12.387,1.072c1.678,0.077,3.018,1.343,3.031,2.903c-0.003,0.388-0.082,0.759-0.223,1.097 \
	c0,0.002,0,0.002-0.002,0.003c-0.055,0.132-0.131,0.257-0.205,0.38c-0.027,0.042-0.049,0.09-0.08,0.133 \
	c-0.061,0.087-0.133,0.167-0.203,0.246c-0.057,0.066-0.111,0.135-0.174,0.195c-0.078,0.074-0.164,0.141-0.249,0.205 \
	c-0.058,0.047-0.116,0.094-0.177,0.135c-0.455,0.298-0.994,0.473-1.576,0.473c-1.594,0-2.891-1.297-2.891-2.89 \
	C9.639,2.406,10.859,1.149,12.387,1.072z M2.208,1.059h7.738C9.148,1.773,8.635,2.799,8.635,3.95c0,1.209,0.564,2.276,1.43,2.991 \
	H2.208c-1.761,0-3.19-1.318-3.19-2.941C-0.982,2.38,0.447,1.059,2.208,1.059z");
        
        switchLinkSvg.appendChild(switchLinkSvgG1);
        switchLinkSvg.appendChild(switchLinkSvgP1);
        
        outerSwitchDiv.appendChild(switchLinkSvg);
         
        switchLink.appendChild(outerSwitchDiv);
      
        chatbarDiv.appendChild(switchLink);
    
        // chatrooms
    
        var chatroomsDiv = document.createElement("DIV");
        chatroomsDiv.setAttribute("id","chatrooms");
        chatroomsDiv.setAttribute("class","outer_chatrooms");
      
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
    
    this.setLastFocus = function(selector){
        var elements = document.querySelectorAll(selector);
        if(elements.length > 1){
            var last = elements[elements.length-1];
            last.focus();
        }
    };
    
    this.getLastTabIndex = function(selector){
        var elements = document.querySelectorAll(selector);
        return elements.length ? elements[elements.length-1].getAttribute('tabindex') : 0;
    };
  
    this.displayChatrooms = function(){
        var chatroomsDiv = document.getElementById('chatrooms');
        var onlineusersDiv = document.getElementById('online_users');
        if(chatroomsDiv.innerHTML === ''){
            var chatroomsHeader = document.createElement("P");
            chatroomsHeader.setAttribute('class', 'chat_title');
            chatroomsHeader.innerHTML = "Chatrooms";
            chatroomsDiv.appendChild(chatroomsHeader);
            chatroomsDiv.style.display = 'block';
      
            var chatroomsList = document.createElement("UL");
            chatroomsList.id = 'chatrooms_list';
            chatroomsList.setAttribute('class', 'chatlist');
            chatroomsDiv.appendChild(chatroomsList);
      
            self.getChatrooms();
            
            var topchatDiv = document.createElement("DIV");
            topchatDiv.setAttribute('class', 'top_chat_icons');
            
            chatroomsDiv.appendChild(topchatDiv);
      
            if(self.user.is_moderator){
                var addChatroomLink = document.createElement("A");
                addChatroomLink.id = "add_chatroom_link";
                addChatroomLink.setAttribute('class', 'add_chatroom');
                addChatroomLink.href = '';
                addChatroomLink.onclick = function() { return self.toggleAddChatroomForm(); };
                
                var addChatroomSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                addChatroomSvg.setAttribute("version","1.1");
                addChatroomSvg.setAttribute("id","Layer_1");
                addChatroomSvg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
                addChatroomSvg.setAttribute("x","0px");
                addChatroomSvg.setAttribute("y","0px");
                addChatroomSvg.setAttribute("width","12px");
                addChatroomSvg.setAttribute("height","12px");
                addChatroomSvg.setAttribute("viewBox","0 0 10 10");
                addChatroomSvg.setAttribute("enable-background","new 0 0 10 10");
                addChatroomSvg.setAttribute("xml:space","preserve");
                
                var addChatroomSvgP1 = document.createElementNS("http://www.w3.org/2000/svg","path");  
                addChatroomSvgP1.setAttribute("fill","#FFFFFF");
                addChatroomSvgP1.setAttribute("d","M5.381,6.968C5.168,6.874,4.58,6.716,4.51,6.448C4.398,6.025,4.821,5.704,5.008,5.37 \
              c0.198-0.352,0.363-0.827,0.393-1.225c0.115-1.425-0.758-2.26-2.012-2.116C2.477,2.133,1.933,2.813,1.874,3.69 \
              c-0.06,0.891,0.272,1.548,0.623,2.034C2.65,5.934,2.811,6.07,2.787,6.326c-0.028,0.3-0.35,0.383-0.58,0.475 \
              C1.934,6.911,1.64,7.076,1.501,7.153C0.868,7.508-0.004,8.161,0.517,8.997c0.351,0.56,1.065,0.67,1.668,0.725 \
              c0.843,0.079,1.688,0.152,2.534,0.084c0.64-0.052,1.633-0.125,2.05-0.7c0.168-0.233,0.192-0.712,0.105-0.979 \
              C6.684,7.562,5.924,7.206,5.381,6.968z");
                
                var addChatroomSvgP2 = document.createElementNS("http://www.w3.org/2000/svg","path");  
                addChatroomSvgP2.setAttribute("fill","#FFFFFF");
                addChatroomSvgP2.setAttribute("d","M8.056,1.95V0.107C8.055,0.037,7.998-0.02,7.929-0.021l-0.485,0c-0.07,0-0.13,0.057-0.13,0.129V1.95h-1.84 \
              c-0.071,0-0.13,0.057-0.13,0.128v0.484c0,0.071,0.059,0.128,0.13,0.129l1.84,0v1.843c0,0.071,0.06,0.127,0.13,0.128h0.485 \
              c0.069,0,0.126-0.057,0.127-0.128L8.055,2.691l1.845,0c0.069,0,0.127-0.058,0.127-0.128V2.078c0-0.071-0.058-0.126-0.127-0.128 \
              H8.056z");
                
                addChatroomSvg.appendChild(addChatroomSvgP1);
                addChatroomSvg.appendChild(addChatroomSvgP2);
                
                addChatroomLink.appendChild(addChatroomSvg);
      
                topchatDiv.appendChild(addChatroomLink);
        
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
                addChatroomFormButton.setAttribute("class","add_btn");
                addChatroomFormButton.value = 'Add';
        
                addChatroomForm.appendChild(addChatroomFormButton); 
        
                chatroomsDiv.appendChild(addChatroomForm);
            }
            
            var addChatroomLink = document.createElement("A");
                addChatroomLink.id = "add_chatroom_link";
                addChatroomLink.setAttribute('class', 'add_chatroom');
                addChatroomLink.href = '';
                addChatroomLink.onclick = function() { return self.toggleAddChatroomForm(); };
            
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
            chatroomsError.text = "";
            chatroomsError.style.display = 'none';
        }else{
            addChatroomForm.style.display = 'block';
        }
    
        return false;  
    }
  
    this.addChatroomToList = function(obj){
        var chatroomsList = document.getElementById('chatrooms_list');
    
        if(chatroomsList){
            var chatroomItem = document.createElement("LI");
            chatroomItem.id = 'chatroom_'+obj.id;
        
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
  
        if(document.querySelectorAll('div#chatroom_'+chatroom.id).length === 0){
            var chatroomchatBlock = document.createElement("DIV");
            chatroomchatBlock.id = 'chatroom_'+chatroom.id;
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
            chatroomchatForm.onsubmit = function(){
                var chatroomchatFormInput = document.getElementById('cc_msg_'+chatroom.id);
                if(chatroomchatFormInput.value){
                    self.sendChatroomMsg({ chatroom_id: chatroom.id, message: chatroomchatFormInput.value, user_id: self.user.user_id, avatar: self.user.avatar, username: self.user.username });
                    chatroomchatFormInput.value = "";
                }
                return false;
            };
            
            var chatroomchatFormInput = document.createElement("TEXTAREA");
                chatroomchatFormInput.id = 'cc_msg_'+chatroom.id;
                chatroomchatFormInput.onkeypress = function(event) {
                    if (event.which === 13) {
                        event.preventDefault();
                        chatroomchatForm.onsubmit();
                    }
                };
                chatroomchatFormInput.onclick = function() { self.removeNotificationChatroomMessage(chatroom.id) };
                
            chatroomchatForm.appendChild(chatroomchatFormInput);
            chatroomchatBlock.appendChild(chatroomchatForm);
            
            this.getChatroomChatMsgs(chatroom.id);
            
        }else{
            self.setDisplay('#chatroom_'+chatroom.id, 'block');
        }
        
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
        self.setDisplay('#private_chat', 'none');
        self.setDisplay('#chatroom_chat', 'none');
        switchLink.className = 'close_chat'; 
    }
  
    this.sendChatroom = function(obj){
        this.doPost('/chatroom', obj, function(data){ 
            if(data){
                socket.emit('add_chatroom_to_list', data);
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
        this.doGet('/online_users/'+this.online_seconds, function(data){ 
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
      
                self.setDisplay('#online_users p', 'none');
      
                document.querySelector('#chat_link span').innerHTML = ' ('+document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length+')'; 
            }
        }
    }
    
    this.removeOnlineUserFromList = function(theuser){
        if(document.querySelectorAll('#online_users_list'+this.user.user_id+' #online_user_'+theuser.user_id).length !== 0){
            document.querySelector('#online_users_list'+this.user.user_id).removeChild(document.querySelector('#online_user_'+theuser.user_id));
            document.querySelector('#chat_link span').innerHTML = ' ('+document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length+')';
            if(document.querySelectorAll('#online_users_list'+this.user.user_id+' li').length === 0){
                self.setDisplay('#online_users p', 'block');
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

        xmlhttp.open("GET", chat_domain+query_string, true);
        xmlhttp.send();
    };
  
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
    
        self.setDisplay('#private_chat', 'block');
        self.setDisplay('.private_chat', 'none');
  
        var privatechatDiv = document.getElementById('private_chat');
  
        if(document.querySelectorAll('#private_chat_'+private_chat.id).length === 0){
            var privatechatBlock = document.createElement("DIV");
            privatechatBlock.id = 'private_chat_'+private_chat.id;
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
            privatechatForm.onsubmit = function(){
                var privatechatFormInput = document.getElementById('pc_msg_'+private_chat.id);
                if(privatechatFormInput.value){
                    self.sendPrivateMsg({ private_chat_id: private_chat.id, message: privatechatFormInput.value, user_id: self.user.user_id, avatar: self.user.avatar, with_user_id: the_user.user_id, username: self.user.username });
                    privatechatFormInput.value = "";
                }
                return false;
            };
  
            privatechatBlock.appendChild(privatechatForm);
            
            var privatechatFormInput = document.createElement("TEXTAREA");
                privatechatFormInput.id = 'pc_msg_'+private_chat.id;
                privatechatFormInput.onkeypress = function(event) {
                    if (event.which === 13) {
                        event.preventDefault();
                        privatechatForm.onsubmit();
                    }
                };
                privatechatFormInput.onclick = function() { self.removeNotificationOfMessage(the_user.user_id) };
    
            privatechatForm.appendChild(privatechatFormInput);
            this.getPrivateChatMsgs(private_chat.id);
    
        }else{
            self.setDisplay('#private_chat_'+private_chat.id, 'block');
        }
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
                self.setLastFocus('#private_chat_msgs_'+private_chat_id+' li');
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
                
                self.setLastFocus('#chatroom_chat_msgs_'+chatroom_id+' li');
            }
        });
    };
  
    this.addMsgToPrivateChat = function(obj){
        var privatechatMsgs = document.getElementById('private_chat_msgs_'+obj.private_chat_id);
        var last_tab_index = this.getLastTabIndex('#private_chat_msgs_'+obj.private_chat_id+' li');
        
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
      
            self.setLastFocus('#private_chat_msgs_'+obj.private_chat_id+' li');
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
            chatroomchatImg.onerror = function(){ chatroomchatImg.src = chat_domain+"/images/img-no-avatar.gif"; };
            chatroomchatMsg.appendChild(chatroomchatImg);
      
            var chatroomchatUsername = document.createElement("SPAN");
            chatroomchatUsername.innerHTML = obj.username;
            chatroomchatMsg.appendChild(chatroomchatUsername);
      
            var chatroomchatText = document.createElement("P");
            chatroomchatText.innerHTML = obj.message;
            chatroomchatMsg.appendChild(chatroomchatText);
    
            chatroomchatMsgs.appendChild(chatroomchatMsg);
     
            this.setLastFocus('#chatroom_chat_msgs_'+obj.chatroom_id+' li');
        }
    }
}