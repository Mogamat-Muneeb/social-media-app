import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createChatRoom = async ({
  user1,
  user2,
}: {
  user1: any;
  user2: any;
}) => {
  const users = [user1, user2].sort();
  const chatRoomId = `${users[0].id}_${users[1].id}`;
  const chatRoomRef = doc(db, "chatRooms", chatRoomId);

  await setDoc(chatRoomRef, { users: [user1.uid, user2.uid] });
};

export const getChatRoomMessages = ({ chatRoomId }: { chatRoomId: any }) => {
  const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
  return query(messagesRef, orderBy("timestamp"));
};
export const sendMessage = async ({
  chatRoomId,
  user,
  text,
  room,
  read = false,
}: {
  chatRoomId: any;
  user: any;
  text: any;
  room: any;
  read?: boolean;
}) => {
  const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
  await addDoc(messagesRef, {
    user,
    text,
    timestamp: new Date(),
    room,
    read,
  });
};

export const generateChatRoomId = async ({
  user1,
  user2,
}: {
  user1: any;
  user2: any;
}) => {
  const users = [user1, user2].sort();
  const chatRoomIdRef = doc(db, "chatRooms", users.join("_"));

  try {
    const chatRoomSnapshot = await getDoc(chatRoomIdRef);
    if (chatRoomSnapshot.exists()) {
      return chatRoomSnapshot.id;
    } else {
      return users.join("_");
    }
  } catch (error) {
    console.error("Error fetching chat room ID: ", error);
    return null;
  }
};

export const getMessages = async () => {
  const chatRoomsRef = collection(db, "chatRooms");
  const messages: any = [];

  try {
    const chatRoomsSnapshot = await getDocs(chatRoomsRef);

    for (const chatRoomDoc of chatRoomsSnapshot.docs) {
      const messagesRef = collection(
        db,
        "chatRooms",
        chatRoomDoc.id,
        "messages"
      );
      const messagesSnapshot = await getDocs(messagesRef);

      messagesSnapshot.forEach((messageDoc) => {
        messages.push(messageDoc.data());
      });
    }

    return messages;
  } catch (error) {
    console.error("Error fetching chat room messages: ", error);
    return null;
  }
};

export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
