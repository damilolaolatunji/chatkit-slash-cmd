import React, { Component } from "react";
import {
  handleInput,
  connectToChatkit,
  connectToRoom,
  sendMessage,
} from "./methods";

import "skeleton-css/css/normalize.css";
import "skeleton-css/css/skeleton.css";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      userId: "",
      currentUser: null,
      currentRoom: null,
      rooms: [],
      messages: [],
      newMessage: "",
      slashCommands: ["/giphy", "/news"]
    };

    this.handleInput = handleInput.bind(this);
    this.connectToChatkit = connectToChatkit.bind(this);
    this.connectToRoom = connectToRoom.bind(this);
    this.sendMessage = sendMessage.bind(this);
  }

  render() {
    const {
      rooms,
      currentRoom,
      currentUser,
      messages,
      newMessage,
    } = this.state;

    const insertTextAtIndices = (text, obj) => {
      return text.replace(/./g, function(character, index) {
        return obj[index] ? obj[index] + character : character;
      });
    };

    const roomList = rooms.map(room => {
      const isRoomActive = room.id === currentRoom.id ? 'active' : '';
      return (
        <li
          className={isRoomActive}
          key={room.id}
          onClick={() => this.connectToRoom(room.id)}
        >
          <span className="room-name">{room.name}</span>
        </li>
      );
    });

    const messageList = messages.map(message => {
      const arr = message.parts.map(p => {
        const urlMatches = p.payload.content.match(/\b(http|https)?:\/\/\S+/gi) || [];
        let text = p.payload.content;
        urlMatches.forEach(link => {
          const startIndex = text.indexOf(link);
          const endIndex = startIndex + link.length;
          text = insertTextAtIndices(text, {
            [startIndex]: `<a href="${link}" target="_blank" rel="noopener noreferrer" class="embedded-link">`,
            [endIndex]: "</a>"
          });
        });

          return (
            <span className="message-text" dangerouslySetInnerHTML={{
              __html: text
            }}></span>
          );
      });

      return (
        <li className="message" key={message.id}>
          <div>
            <span className="user-id">{message.senderId}</span>
            {arr}
          </div>
        </li>
      )
    });

    return (
      <div className="App">
        <aside className="sidebar left-sidebar">
          {!currentUser ? (
              <div className="login">
                <h3>Join Chat</h3>
                <form id="login" onSubmit={this.connectToChatkit}>
                  <input
                    onChange={this.handleInput}
                    className="userId"
                    type="text"
                    name="userId"
                    placeholder="Enter your username"
                  />
                </form>
              </div>
            ) : null
          }
          {currentRoom ? (
            <div className="room-list">
              <h3>Rooms</h3>
              <ul className="chat-rooms">
                {roomList}
              </ul>
            </div>
            ) : null
          }
        </aside>
        {
          currentUser ? (
            <section className="chat-screen">
              <ul className="chat-messages">
                {messageList}
              </ul>
              <footer className="chat-footer">
                <form onSubmit={this.sendMessage} className="message-form">
                  <input
                    type="text"
                    value={newMessage}
                    name="newMessage"
                    className="message-input"
                    placeholder="Type your message and hit ENTER to send"
                    onChange={this.handleInput}
                  />
                </form>
              </footer>
            </section>
          ) : null
        }
      </div>
    );
  }
}

export default App;
