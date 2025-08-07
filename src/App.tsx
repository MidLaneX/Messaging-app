import React from "react";
import "./App.css";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import { useUsers, useMessages } from "./hooks";
import { mockUsers, mockMessages, currentUser } from "./data/mockData";

function App() {
  const {
    users,
    currentUser: user,
    selectedUser,
    setSelectedUser,
  } = useUsers(mockUsers, currentUser);

  const { addMessage, getMessagesForUsers, getUnreadCount, getLastMessage } =
    useMessages(mockMessages);

  const handleSendMessage = (content: string) => {
    if (!selectedUser) return;
    addMessage(content, user.id, selectedUser.id);
  };

  const getMessagesForUser = (userId: string) => {
    return getMessagesForUsers(user.id, userId);
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="flex h-full">
        <UserList
          users={users}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          getLastMessage={getLastMessage}
          getUnreadCount={getUnreadCount}
          currentUserId={user.id}
        />
        <ChatWindow
          selectedUser={selectedUser}
          currentUser={user}
          messages={getMessagesForUser(selectedUser?.id || "")}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;
