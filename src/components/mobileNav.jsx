import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { VscHome } from "react-icons/vsc";
import { FiPlusSquare } from "react-icons/fi";
import { BiLogIn } from "react-icons/bi";
import { LogoutIcon } from "./icon";
export const MobileNav = () => {
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
    <>
      <div
        className={`md:hidden block fixed bottom-0 right-0 left-0 z-[60]  ${
          user
            ? "bg-white border-t-[1px] border-gray-300 text-black py-4 "
            : "bg-white shadow-lg py-4 text-black"
        } `}
      >
        <div
          className={`flex items-center   w-full mx-auto lg:px-0  px-10  ${
            user ? " justify-between " : " justify-between "
          }`}
        >
          {/* <div className="flex items-center gap-4"> */}
            <Link
              to="/"
              className={`font-medium md:text-[16px] text-[14px] flex flex-col items-center ${
                pathName.pathname === "/" && "text-[#ff3040]"
              }`}
            >
              <span>
                <VscHome className="text-[23px] font-bold" />
              </span>
              <span  className="text-[12px]">Home</span>
            </Link>
            <Link
              to="/createpost"
              className={`font-medium md:text-[16px] text-[14px] flex flex-col items-center ${
                user ? "block" : "hidden"
              } ${pathName.pathname === "/createpost" && "text-[#ff3040]"} `}
            >
              <FiPlusSquare className="text-[22px]" />
              <span  className="text-[12px] pt-[3px]"> {user && "Create" }</span>
            </Link>
            {user?.uid ? null : (
              <>
                <Link
                  to="/login"
                  className={`font-medium md:text-[16px]  text-[14px]  flex items-center flex-col justify-center ${
                    pathName.pathname === "/login" && "text-[#ff3040]"
                  }`}
                >
                  <BiLogIn  className="text-[23px] font-semibold"/>
                  Login
                </Link>
              </>
            )}
          {/* </div> */}
          {/* <div className="flex items-center gap-4"> */}
            {user && (
              <>
                <Link to={user?.uid} className="flex flex-col items-center">
                  <img
                    src={userData?.photoURL}
                    alt={user?.displayName || ""}
                    className={`object-cover w-6 h-6 rounded-full  ${
                      pathName.pathname === `/${user?.uid}` &&
                      "border-[1px] border-[#ff3040] "
                    }`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://i.postimg.cc/zfyc4Ftq/image.png";
                    }}
                  />
                    <span  className={`text-[12px] ${pathName.pathname === `/${user?.uid}` && "text-[#ff3040]"}`}> {user && "Profile" }</span>
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
                  className="font-normal text-[16px] md:hidden flex flex-col items-center"
                >
                  <LogoutIcon />
                  <span className="text-[12px]"> {user && "Logout" }</span>
                </button>
              </>
            )}
          </div>
        </div>
      {/* </div> */}
    </>
  );
};
