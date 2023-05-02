import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

export const Navbar = () => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const pathName = useLocation() || "/";
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const signUserOut = async () => {
    // console.log("auth:", auth);
    if (auth) {
      // console.log("auth.currentUser:", auth.currentUser);
      await signOut(auth);
      navigate("/");
    }
  };
  useEffect(() => {
    if (user && user.uid) {
      const docRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserData(docSnapshot.data());
        } else {
          console.log("No such document!");
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  return (
    <div
      className={` sticky top-0 right-0 left-0 z-[60]  ${
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
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link to={user?.uid}>
                <img
                  src={userData?.photoURL}
                  alt={user?.displayName || ""}
                  className="object-cover w-8 h-8 rounded-full md:w-10 md:h-10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://i.postimg.cc/zfyc4Ftq/image.png";
                  }}
                />
              </Link>
              <div className="flex-col hidden md:flex text-start">
                <Link to={user?.uid}>
                  <p className="font-normal text-[14px] flex flex-col">
                    {userData?.userName ? (
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
                    )}
                    <span>{userData?.displayName}</span>
                  </p>
                </Link>
              </div>
              <button
                onClick={signUserOut}
                className="font-normal text-[16px] md:block hidden"
              >
                Logout
              </button>
              <button
                onClick={signUserOut}
                className="font-normal text-[16px] md:hidden block"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
