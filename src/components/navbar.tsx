import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export const Navbar = () => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const pathName = useLocation() || "/";
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const signUserOut = async () => {
    if (auth) {
      await signOut(auth);
      navigate("/");
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      const docRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          //@ts-ignore
          setUserData(docSnapshot.data());
        } else {
          console.log("No such document!");
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const [notifications, setNotifications] = useState([]);

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
//@ts-ignore
  const filteredNotifications = notifications.filter(notification => !notification.viewedBy?.includes(user?.uid));
const count = filteredNotifications.length;


  return (
    <>
      <div className="flex justify-center md:hidden border-b-[1px] py-2 border-gray-200 sticky top-0 right-0 left-0 z-[60]  bg-white">
        <Link to="/" className="font-bold text-[24px] text-[#ff3040]">
          Circledop
        </Link>
      </div>
      <div
        className={`md:block hidden sticky top-0 right-0 left-0 z-[60]  ${
          user ? "bg-black text-white " : "bg-white shadow-lg py-2 text-black"
        } `}
      >
        <div
          className={`flex items-center max-w-[1228px] w-full mx-auto lg:px-0 md:px-2 px-4 py-2 ${
            user ? " justify-between" : " justify-center "
          }`}
        >
          <div className="flex gap-4">
            <Link
              to="/"
              className={`font-medium md:text-[16px] text-[14px] ${
                pathName.pathname === "/" && "text-[#ff3040]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/createpost"
              className={`font-medium md:text-[16px] text-[14px] ${
                user ? "block" : "hidden"
              } ${pathName.pathname === "/createpost" && "text-[#ff3040]"} `}
            >
              Create
            </Link>
            {/* <Link
              to="/explore"
              className={`font-medium md:text-[16px] text-[14px] ${
                user ? "block" : "hidden"
              } ${pathName.pathname === "/explore" && "text-[#ff3040]"} `}
            >
              Explore
            </Link> */}
            <Link
              to="/notifications"
              className={`font-medium md:text-[16px] text-[14px] ${
                user ? "block" : "hidden"
              } ${pathName.pathname === "/notifications" && "text-[#ff3040]"} `}
            >
              <div
                className={`${
                  count
                    ? "bg-[#ff3040] rounded-full w-[10px] h-[10px] justify-end items-end absolute ml-[90px]"
                    : ""
                }`}
              ></div>
              <span className="relative">Notifications</span>
            </Link>
            {user?.uid ? null : (
              <>
                <Link
                  to="/login"
                  className={`font-medium md:text-[16px]  text-[14px] ${
                    pathName.pathname === "/login" && "text-[#ff3040]"
                  }`}
                >
                  Login
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link to={user?.uid}>
                  <img
                    //@ts-ignore
                    src={userData?.photoURL}
                    alt={user?.displayName || ""}
                    className="object-cover w-10 h-10 rounded-full"
                    onError={(e) => {
                      //@ts-ignore
                      e.target.onerror = null;
                      //@ts-ignore
                      e.target.src = "https://i.postimg.cc/zfyc4Ftq/image.png";
                    }}
                  />
                </Link>
                <div className="flex-col hidden md:flex text-start">
                  <Link to={user?.uid}>
                    <p className="font-normal text-[14px] flex flex-col">
                      {
                        /*@ts-ignore */
                        userData?.userName ? (
                          /*@ts-ignore */
                          <>{userData?.userName}</>
                        ) : (
                          <>
                            {user?.displayName
                              ?.split(" ")
                              .map(
                                (word) =>
                                  word.substring(0, 1).toUpperCase() +
                                  word.substring(1)
                              )
                              .join(" ")}
                          </>
                        )
                      }
                      <span>
                        {
                          /*@ts-ignore */
                          userData?.displayName
                        }
                      </span>
                    </p>
                  </Link>
                </div>
                <button
                  onClick={signUserOut}
                  className="font-normal text-[16px] md:block hidden"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
