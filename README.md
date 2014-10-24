Chat
=========

Chat example

1. This is a modified version of http://socket.io/get-started/chat/.
2. Modified broadcast to only update a specific chatroom.
3. Embed the following scripts on client:
    <pre>
    ```
    General integration:

    <script type="text/javascript" src="/js/jquery-1.10.2.js"></script>
    <script src="<path-to-plugin-domain>:3000/socket.io/socket.io.js"></script>
    <script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/chat.js"></script>
    <script type="text/javascript">
      $(function(){
        $('#chat').initChat(<username>, <user_id>);
      });
    </script>

    Xenforo integration:

    1. Create "chat_bar" custom template. 
        <div id="chat"></div>
    2. In PAGE_CONTAINER template, add the following xenforo script where you want to add your chat box when user is logged-in.
        <xen:if is="{$visitor.user_id}">
          <xen:include template="chat_bar" />
         </xen:if>
    3. In page_container_js_body template, add the following xenforo script at the end.
        <xen:if is="{$visitor.user_id}">
          <script src="<path-to-plugin-domain>:3000/socket.io/socket.io.js"></script>
          <script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/chat.js"></script>
          <script type="text/javascript">
            $(function(){
              $('#chat').initChat('{$visitor.username}', {$visitor.user_id});
            });
          </script>
        </xen:if>
       
    ```
    </pre>
4. Run "node index.js" and mongodb (dbpath = \data\db) on plugin
