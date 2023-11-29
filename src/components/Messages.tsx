import React, { useEffect, useState } from "react";

import Chat from "../components/Messages/Chat";
import ChatArea from "../components/Messages/ChatArea";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getMessages } from "../helper";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import ProtectedRoute from "./ProtectedRoute";

const Messages = () => {
  const { uuid } = useParams();
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [usersChat, setUsersChat] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const postsRef = collection(db, "users");
  const q = query(postsRef);
  const getUsers = async () => {
    onSnapshot(q, (snapshot: any) => {
      const user = snapshot?.docs?.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(user);
    });
  };

  const getUserByUUID = async (uuid: any) => {
    const userQuery = query(postsRef, where("uid", "==", uuid));

    onSnapshot(userQuery, (snapshot) => {
      const user: any = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (user.length > 0) {
        setUsersChat(user[0]);
      } else {
        setCurrentUser([]);
      }
    });
  };

  const fetchAllMessages = async () => {
    const allMessages = await getMessages();
    setAllMessages(allMessages);
  };

  useEffect(() => {
    // getUsersCurrentUser();
    getUsers();
    getUserByUUID(uuid || "");
    fetchAllMessages();
  }, [uuid]);

  useEffect(() => {
    const userWithUuid = users.find((user: any) => user.id === uuid);
    if (userWithUuid) {
      setSelectedUser(userWithUuid);
    } else {
      setSelectedUser(null);
    }
  }, [uuid, users]);

  const handleStartChat = async (otherUser: any) => {
    setSelectedUser(otherUser);
  };

  return (
    <>
      <ProtectedRoute>
        <div className="flex ">
          <div className="sidenav border-gray-400 w-full mt-5 lg:max-w-[350px] ">
            <Chat
              allUsers={users}
              currentUser={user}
              allMessages={allMessages}
              handleStartChat={handleStartChat}
              selectedUser={selectedUser}
            />
          </div>
          <div className="w-full h-full lg:ml-[350px]  px-4">
            <ChatArea
              currentUser={user}
              otherUser={uuid || ""}
              usersChat={usersChat}
            />
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
};

export default Messages;
