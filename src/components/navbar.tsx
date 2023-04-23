import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export const Navbar = () => {
  const [user] = useAuthState(auth);

  const signUserOut = async () => {
    await signOut(auth);
  };
  return (
    <div
      className={` sticky top-0 right-0 left-0  ${
        user ? "bg-[#212529] text-white " : "text-black"
      } `}
    >
      <div
        className={`flex items-center max-w-[1228px] w-full mx-auto py-2 ${
          user ? " justify-between" : " justify-center "
        }`}
      >
        <div className="flex gap-4">
          <Link to="/" className="font-medium text-[16px]">
            Home
          </Link>
          <Link
            to="/createpost"
            className={`font-medium text-[16px] ${user ? "block" : "hidden"}`}
          >
            Create
          </Link>
          {user ? null : (
            <>
              <Link to="/login" className="font-medium text-[16px]">
                Login
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <img
                src={user?.photoURL || ""}
                alt={user?.displayName || ""}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col text-start">
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
              <button onClick={signUserOut} className="font-medium text-[16px]">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
