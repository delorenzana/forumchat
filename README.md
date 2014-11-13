Chat
=========

Chat example

1. This is a modified version of http://socket.io/get-started/chat/.
2. Modified broadcast to only update a specific chatroom or private chat.
3. Embed the following scripts on client:
    <pre>
    General integration:
    ```
    <link type="text/css" rel="stylesheet" media="all" href="<path-to-plugin-domain>/public/stylesheets/chat.css" charset="utf-8" />
    <script type="text/javascript" src="/js/jquery-1.10.2.js"></script>
    <script src="<path-to-plugin-domain>:3000/socket.io/socket.io.js"></script>
    <script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/index.js"></script>
    <script type="text/javascript">
      $(function(){
        $('#chat').initChat({ username: '<username>', user_id: <user_id>, is_moderator: <is_moderator>, avatar: <avatar>, online_seconds: <online_seconds> });
      });
    </script>
    ```
    Xenforo integration:

    1. Create "chatbar" custom template. 
        ```
        <div id="chat"></div>
        ```
    2. In "PAGE_CONTAINER" template, add the following xenforo scripts: 
        your chat stylesheet
        ```
        <xen:if is="{$visitor.user_id}">
          <link type="text/css" rel="stylesheet" media="all" href="<path-to-plugin-domain>/public/stylesheets/chat.css" charset="utf-8" />
        </xen:if>
       ```
       where you want to add your chat box when user is logged-in.
       ```
        <xen:if is="{$visitor.user_id}">
          <xen:include template="chatbar" />
         </xen:if>
        ```
    3. In page_container_js_body template, add the following xenforo script at the end.
        ```
        <xen:if is="{$visitor.user_id}">
          <script src="<path-to-plugin-domain>:3000/socket.io/socket.io.js"></script>
          <script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/index.js"></script>
          <script type="text/javascript">
            $(function(){
              $('#chat').initChat({ username: '{$visitor.username}', user_id: {$visitor.user_id}, is_moderator: {$visitor.is_moderator}, avatar: 'data/avatars/s/0/'+{$visitor.user_id}+'.jpg', online_seconds: 300 });
            });
          </script>
        </xen:if>
        ```
    </pre>
4. Run "node .\bin\www" and mongodb (dbpath = \data\db) on plugin
