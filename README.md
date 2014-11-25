Chat
=========

Chat example

1. This is a modified version of http://socket.io/get-started/chat/.
2. Modified broadcast to only update a specific chatroom or private chat.
3. Embed the following scripts on client:
    <pre>
    Xenforo integration:

    1. Create "chatbar" custom template. 
        ```
        <div id="chat"></div>
        ```
    2. Add socket.io.js file to /js folder and chat.css to /styles folder.
    3. In "PAGE_CONTAINER" template, add the following xenforo scripts: 
        socket.io.js and your chat stylesheet
        ```
        <xen:if is="{$visitor.user_id}">
          <script src="/js/socket.io.js"></script>
          <link type="text/css" rel="stylesheet" media="all" href="/styles/chat.css" charset="utf-8" />
        </xen:if>
       ```
       where you want to add your chat box when user is logged-in.
       ```
        <xen:if is="{$visitor.user_id}">
          <xen:include template="chatbar" />
         </xen:if>
        ```
    4. In page_container_js_body template, add the following xenforo script at the end.
        ```
        <xen:if is="{$visitor.user_id}">
          <script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/index.js"></script>
          <script type="text/javascript">
              initChat({ chat_container_id: 'chat', chat_domain: 'http://localhost:3000', username: '{$visitor.username}', user_id: {$visitor.user_id}, is_moderator: {$visitor.is_moderator}, avatar: 'data/avatars/s/0/'+{$visitor.user_id}+'.jpg', online_seconds: 300, img_no_avatar: 'data/avatars/img-no-avatar.gif' });
          </script>
        </xen:if>
        ```
    </pre>
    5. Change allowed_origin variable in plugin app.js to specify origin domain.
    6. Run "set DEBUG=chat & node .\bin\www" on plugin.
