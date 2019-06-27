import { ChatManager, TokenProvider } from "@pusher/chatkit-client";

function handleInput(event) {
  const { value, name } = event.target;

  this.setState({
    [name]: value
  });
}

function connectToChatkit(event) {
  event.preventDefault();
  const { userId } = this.state;

  const tokenProvider = new TokenProvider({
    url:
    "<your test token endpoint>"
  });

  const chatManager = new ChatManager({
    instanceLocator: "<your instance locator>",
    userId,
    tokenProvider
  });

  return chatManager
    .connect()
    .then(currentUser => {
      this.setState(
        {
          currentUser,
        },
        () => connectToRoom.call(this)
      );
    })
    .catch(console.error);
}

function connectToRoom(roomId = "<your room id>") {
  const { currentUser } = this.state;
  this.setState({
    messages: []
  });

  return currentUser
    .subscribeToRoomMultipart({
      roomId,
      messageLimit: 10,
      hooks: {
        onMessage: message => {
          this.setState({
            messages: [...this.state.messages, message],
          });
        },
      }
    })
    .then(currentRoom => {
      this.setState({
        currentRoom,
        rooms: currentUser.rooms,
      });
    })
    .catch(console.error);
}

function sendNews(query) {
  const { currentUser, currentRoom } = this.state;

  fetch(`https://newsapi.org/v2/everything?q=${query}&pageSize=3&apiKey=<your news api key>`)
    .then(res => res.json())
    .then(data => {
      const parts = [];
      data.articles.forEach(article => {
        parts.push({
          type: "text/plain",
          content: `${article.title} - ${article.source.name} - ${article.url}`
        });
      });

      currentUser.sendMultipartMessage({
        roomId: `${currentRoom.id}`,
        parts
      });
    })
    .catch(console.error);
}

function handleSlashCommand(message) {
  const cmd = message.split(" ")[0];
  const txt = message.slice(cmd.length)

  if (cmd !== "/news") {
    alert(`${cmd} is not a valid command`);
    return;
  }

   return sendNews.call(this, txt);
}

function sendMessage(event) {
  event.preventDefault();
  const { newMessage, currentUser, currentRoom } = this.state;
  const parts = [];

  if (newMessage.trim() === "") return;

  if (newMessage.startsWith("/")) {
    handleSlashCommand.call(this, newMessage);

    this.setState({
      newMessage: "",
    });
    return;
  }

  parts.push({
    type: "text/plain",
    content: newMessage
  });

  currentUser.sendMultipartMessage({
    roomId: `${currentRoom.id}`,
    parts
  });

  this.setState({
    newMessage: "",
  });
}

export {
  handleInput,
  connectToRoom,
  connectToChatkit,
  sendMessage,
}
