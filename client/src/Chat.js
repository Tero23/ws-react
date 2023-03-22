import React, { useState, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";

const SERVER_URL = "http://localhost:8000/api/v1/messages";

const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const message = {
        room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await axios.post(SERVER_URL, message);

      await socket.emit("send_message", message);
      setCurrentMessage("");
      setMessageList((prev) => [...prev, message]);
    }
  };

  const getOlderMessages = async () => {
    const messages = await axios.get(`${SERVER_URL}/${room}`);
    setMessageList(messages.data);
  };

  useEffect(() => {
    getOlderMessages();
    socket.on("receive_message", (data) => {
      console.log(
        `${data.author} says ${data.message} in room ${data.room} at time ${data.time}`
      );
      setMessageList((prevMessages) => [...prevMessages, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.length &&
            messageList.map((obj) => {
              return (
                <div
                  className="message"
                  key={Math.random()}
                  id={username === obj.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{obj.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{obj.time}</p>
                      <p id="author">{obj.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default Chat;
