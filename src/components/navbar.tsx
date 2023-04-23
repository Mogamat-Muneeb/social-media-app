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
      className={`flex items-center max-w-[1228px] w-full mx-auto py-2 ${
        user ? " justify-between" : " justify-center "
      }`}
    >
      <div className="flex gap-4">
        <Link to="/" className="font-medium text-[16px]">
          Home
        </Link>
        {user ? null : (
          <Link to="/login" className="font-medium text-[16px]">
            Login
          </Link>
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
              <p className="font-medium text-[14px]"> {user?.displayName} </p>
              <p className="font-normal text-[14px]"> {user?.email} </p>
            </div>
            <button onClick={signUserOut} className="font-medium text-[16px]">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};
