import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  Unsubscribe,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  console.log(
    "🚀 ~ file: notifications.tsx:16 ~ Notifications ~ notifications:",
    notifications
  );
  const [user] = useAuthState(auth);
  console.log("🚀 ~ file: notifications.tsx:18 ~ Notifications ~ user:", user);

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
      viewedBy: arrayUnion(user?.uid),
    });
  };

  const currentDate = new Date();

  return (
    <div className="max-w-[1220px] mx-auto w-full">
      <h2 className="font-bold md:text-[32px] text-[20px] pt-10">
        Notifications
      </h2>
      {notifications.map((notification: any) => {
        const postDate = new Date(notification.date);
        const diffInMinutes = Math.floor(
          /* @ts-ignore */
          (currentDate - postDate) / (1000 * 60)
        );

        let timeAgo;

        if (diffInMinutes >= 43200) {
          const diffInMonths = Math.floor(diffInMinutes / 43200);
          timeAgo = `${diffInMonths}m`;
        } else if (diffInMinutes >= 1440) {
          const diffInDays = Math.floor(diffInMinutes / 1440);
          timeAgo = `${diffInDays}d`;
        } else if (diffInMinutes >= 60) {
          const diffInHours = Math.floor(diffInMinutes / 60);
          timeAgo = `${diffInHours}h`;
        } else {
          timeAgo = `${diffInMinutes}m`;
        }

        return (
          <div
            className="px-4 md:px-0"
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            <div className="pt-4 ">
              <hr />
              {notification.viewedBy &&
              notification.viewedBy.includes(user?.uid) ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-start pt-4 text-rose-600">
                    {/* (Already viewed) */}
                    <Link to={`/posts/${notification.postId}`}>
                      {/* <p>{notification.postId} (Already viewed)</p> */}
                      <p>
                        {notification.userName
                          ? notification.userName
                          : notification.username}
                      </p>
                      <p>{notification.usage} </p>
                    </Link>
                    <span className="px-2">.{timeAgo}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col pt-4">
                  {/* <h2 className="font-bold text-[16px]">New</h2> */}
                  {/* (Already viewed) */}
                  <div className="flex items-center justify-start pt-4">
                    <Link to={`/posts/${notification.postId}`}>
                      {/* <p>{notification.postId} (Not viewed yet)</p> */}
                      <p>
                        {notification.userName
                          ? notification.userName
                          : notification.username}
                      </p>
                      <p>{notification.usage} </p>
                    </Link>
                    <span className="px-2">.{timeAgo}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;

// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   onSnapshot,
//   updateDoc,
//   Unsubscribe,
//   arrayUnion,
// } from "firebase/firestore";
// import { auth, db } from "../config/firebase";
// import { Link } from "react-router-dom";
// import { useAuthState } from "react-firebase-hooks/auth";

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   console.log(
//     "🚀 ~ file: notifications.tsx:155 ~ Notifications ~ notifications:",
//     notifications
//   );
//   const [user] = useAuthState(auth);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       const notificationsRef = collection(db, "notifications");
//       const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
//         const updatedNotifications = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         //@ts-ignore
//         setNotifications(updatedNotifications);
//       });

//       return unsubscribe;
//     };

//     let unsubscribe: Unsubscribe | undefined;

//     const getNotifications = async () => {
//       unsubscribe = await fetchNotifications();
//     };

//     getNotifications();

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, []);

//   const handleNotificationClick = async (notificationId: any) => {
//     const notificationDocRef = doc(db, "notifications", notificationId);
//     await updateDoc(notificationDocRef, {
//       viewedBy: arrayUnion(user?.uid),
//     });
//   };

//   const currentDate = new Date();

//   // Filter out notifications for posts that the user hasn't posted
//   const filteredNotifications = notifications.filter(
//     (notification) =>
//       //@ts-ignore
//       notification.usage === "liked your post"
//        ||
//       //@ts-ignore
//       notification.userId === user?.uid
//   );

//   return (
//     <div className="max-w-[1220px] mx-auto w-full">
//       <h2 className="font-bold md:text-[32px] text-[20px] pt-10">
//         Notifications
//       </h2>
//       {filteredNotifications.map((notification: any) => {
//         const postDate = new Date(notification.date);
//         const diffInMinutes = Math.floor(
//           /* @ts-ignore */
//           (currentDate - postDate) / (1000 * 60)
//         );

//         let timeAgo;

//         if (diffInMinutes >= 43200) {
//           const diffInMonths = Math.floor(diffInMinutes / 43200);
//           timeAgo = `${diffInMonths}m`;
//         } else if (diffInMinutes >= 1440) {
//           const diffInDays = Math.floor(diffInMinutes / 1440);
//           timeAgo = `${diffInDays}d`;
//         } else if (diffInMinutes >= 60) {
//           const diffInHours = Math.floor(diffInMinutes / 60);
//           timeAgo = `${diffInHours}h`;
//         } else {
//           timeAgo = `${diffInMinutes}m`;
//         }

//         return (
//           <div
//             className="px-4 md:px-0"
//             key={notification.id}
//             onClick={() => handleNotificationClick(notification.id)}
//             style={{ cursor: "pointer", marginBottom: "10px" }}
//           >
//             <div className="pt-4 ">
//               <hr />
//               {notification.viewedBy &&
//               notification.viewedBy.includes(user?.uid) ? (
//                 <div className="flex flex-col">
//                   <div className="flex items-center justify-start pt-4 text-rose-600">
//                     {/* (Already viewed) */}
//                     <Link to={`/posts/${notification.postId}`}>
//                       {/* <p>{notification.postId} (Already viewed)</p> */}
//                       <p>
//                         {notification.userName
//                           ? notification.userName
//                           : notification.username}
//                       </p>
//                       <p>
//                         {user?.uid === notification.userId ? "You" : ""}
//                         {notification.usage}
//                       </p>
//                     </Link>
//                     <span className="px-2">.{timeAgo}</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col pt-4">
//                   {/* <h2 className="font-bold text-[16px]">New</h2> */}
//                   {/* (Already viewed) */}
//                   <div className="flex items-center justify-start pt-4">
//                     <Link to={`/posts/${notification.postId}`}>
//                       {/* <p>{notification.postId} (Not viewed yet)</p> */}
//                       <p>
//                         {notification.userName
//                           ? notification.userName
//                           : notification.username}
//                       </p>
//                       <p>
//                        {notification.usage === "created a post"  ? user?.uid === notification.userId ? "You" : "" : ""}
//                         {notification.usage}
//                       </p>
//                     </Link>
//                     <span className="px-2">.{timeAgo}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Notifications;
