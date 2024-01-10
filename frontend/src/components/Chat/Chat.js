import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";

import "./Chat.css";

const ENDPOINT = "http://localhost:5000";

let socket;

const Chat = () => {
  const navigate = useNavigate();
  const { name, room } = useParams();

  useEffect(() => {
    // Connect to the socket
    socket = io(ENDPOINT);
    console.log(name + " " + room);

    // Join the room
    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
        navigate("/"); // Redirect to home or handle the error as needed
      }
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [name, room, navigate]);

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for updated user list
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      // Send the message to the server
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
