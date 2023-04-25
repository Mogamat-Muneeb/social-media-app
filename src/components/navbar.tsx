import { Link, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export const Navbar = () => {
  const [user] = useAuthState(auth);

  const pathName = useLocation();

  const signUserOut = async () => {
    await signOut(auth);
  };
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
          {user ? null : (
            <>
              <Link
                to="/login"
                className={`font-medium md:text-[16px]  text-[14px] ${pathName.pathname === "/login" && "text-[#ff3040]"}`}
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
                src={user?.photoURL || ""}
                alt={user?.displayName || ""}
                className="w-8 h-8 rounded-full md:w-10 md:h-10"
              />
            </Link>
              <div className="flex-col hidden md:flex text-start">
                <p className="font-medium text-[14px]">
                  {user?.displayName
                    ?.split(" ")
                    .map(
                      (word) =>
                        word.substring(0, 1).toUpperCase() + word.substring(1)
                    )
                    .join(" ")}
                </p>

                <p className="font-normal text-[14px]"> {user?.email} </p>
              </div>
              <button
                onClick={signUserOut}
                className="font-medium text-[16px] md:block hidden"
              >
                Logout
              </button>
              <button
                onClick={signUserOut}
                className="font-medium text-[16px] md:hidden block"
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
