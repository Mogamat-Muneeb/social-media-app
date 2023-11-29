import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import {
  formatTimestamp,
  generateChatRoomId,
  getChatRoomMessages,
  sendMessage,
} from "../../helper";
import { auth, db } from "../../config/firebase";
import { LoadingSpinner } from "../icon";

const ChatArea = ({
  currentUser,
  otherUser,
  usersChat,
}: // setShowChat,
{
  currentUser: any;
  otherUser: any;
  usersChat: any;
  // setShowChat: any;
}) => {
  const { uuid } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomID, setRoomID] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Getting chat id
  const roomChat = async () => {
    const chatRoomId: any = await generateChatRoomId({
      user1: currentUser?.uid,
      user2: uuid,
    });

    setRoomID(chatRoomId);
  };

  const handleSendMessage = async () => {
    const chatRoomDocRef = doc(db, "chatRooms", roomID);

    // Check if the document exists
    getDoc(chatRoomDocRef)
      .then(async (docSnapshot) => {
        if (docSnapshot.exists()) {
          //  Now update the message in the roomID
          const email = auth?.currentUser?.email;
          setNewMessage("");
          await sendMessage({
            chatRoomId: roomID,
            user: email,
            text: newMessage,
            room: roomID,
          });
        } else {
          //  Create the chatroom
          const currentUserUUID = currentUser.uid;
          const email = auth?.currentUser?.email;
          const chatRoomId = await generateChatRoomId({
            user1: uuid,
            user2: currentUserUUID,
          });
          setNewMessage("");
          await sendMessage({
            chatRoomId: chatRoomId,
            user: email,
            text: newMessage,
            room: chatRoomId,
          });
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (uuid && currentUser && currentUser && currentUser.uid) {
        try {
          setLoadingMessages(true);
          const currentUserUUID = currentUser.uid;
          const chatRoomId = await generateChatRoomId({
            user1: currentUserUUID,
            user2: uuid,
          });
          const chatQuery = getChatRoomMessages({ chatRoomId: chatRoomId });
          const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
            const msgs: any = snapshot.docs.map((doc) => doc.data());
            setMessages(msgs);
            setLoadingMessages(false);
          });
          return () => unsubscribe();
        } catch (error) {
          console.error("Error fetching chat room ID:", error);
          setLoadingMessages(false);
        }
      }
    };
    roomChat();
    fetchData();
  }, [uuid, currentUser]);

  return (
    <>
      {uuid ? (
        <>
          {/* <button onClick={() => setShowChat(true)}>backl</button> */}
          <div className="flex w-full justify-start gap-4 items-center fixed bg-white z-[60] h-[60px]">
            <img
              src={usersChat?.photoURL || ""}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <h2 className="font-semibold text-[18px]">
              {usersChat?.displayName}
            </h2>
          </div>
          <div className="">
            <div
              className={`lg:h-[650px]  md:h-[600px]  overflow-y-auto no-scrollbar  flex flex-col  basis-0 grow mx-4 pt-14 `}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center w-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center w-full">
                    {messages.length === 0 && "No message found.."}
                  </div>
                  {messages.map((message: any) => {
                    return (
                      <>
                        <div
                          className={`max-w-full w-full ${
                            message.user === currentUser.email
                              ? " flex justify-end items-end "
                              : "flex justify-start items-start"
                          }`}
                        >
                          <div
                            key={message.timestamp}
                            className={`py-[40px] ${
                              message.user === currentUser.email ? "" : ""
                            }`}
                          >
                            <div
                              className={`max-w-full w-full flex flex-col ${
                                message.user === currentUser.email
                                  ? "bg-gray-300 py-2 px-4 w-full max-w-[400px] text-white rounded-2xl  flex justify-center items-center "
                                  : "bg-gray-700 py-2 px-4 w-full max-w-[400px] text-white rounded-2xl  flex justify-center items-center"
                              }`}
                            >
                              <p>
                                <span>{message.text}</span>
                                {/* {`${message.user}:
                           ${}`} */}
                              </p>
                              <span className=" flex justify-end items-end w-full text-[10px]">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </>
              )}
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center justify-center w-full gap-4 "
            >
              <div className="w-full px-3">
                <input
                  type="text"
                  placeholder="Type a message"
                  className="w-full h-[40px] border border-gray-300 max-w-full px-3 rounded-2xl outline-none focus:outline-none  "
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  onClick={handleSendMessage}
                  className="relative  left-[90%] bottom-[31px]"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <>chat now</>
      )}
    </>
  );
};

export default ChatArea;
