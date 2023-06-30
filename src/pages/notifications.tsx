import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notificationsRef = collection(db, "notifications");
      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        const updatedNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //@ts-ignore
        setNotifications(updatedNotifications);
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | undefined;

    const getNotifications = async () => {
      unsubscribe = await fetchNotifications();
    };

    getNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleNotificationClick = async (notificationId: any) => {
    const notificationDocRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationDocRef, {
      viewedBy: user?.uid,
    });
  };

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification.id)}
          style={{ cursor: "pointer", marginBottom: "10px" }}
        >
          {notification.viewedBy && notification.viewedBy === user?.uid ? (
            <div>
              <Link to={`/posts/${notification.postId}`}>
                <p>{notification.postId} (Already viewed)</p>
              </Link>
            </div>
          ) : (
            <div>
              <Link to={`/posts/${notification.postId}`}>
                <p>{notification.postId} (Not viewed yet)</p>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
