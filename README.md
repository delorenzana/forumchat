Chat
=========

Chat example

1. This is a modified version of http://socket.io/get-started/chat/.
2. Modified broadcast to only update a specific chatroom.
3. Embed the following scripts on client:
    <pre>
    <code><script type="text/javascript" src="/js/jquery-1.10.2.js"></script></code>
    <code><script src="http://localhost:3000/socket.io/socket.io.js"></script></code>
    <code><script type="text/javascript" src="<path-to-plugin-domain>/public/javascripts/chat.js"></script></code>
    <code><script type="text/javascript">$(function(){ $('#chat').initChat(<chatroom-name>); });
    </script></code>
    </pre>
4. Run "node index.js" and mongodb (dbpath = \data\db) on plugin
