import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { ExitIcon } from "../components/icon";
const Modal = ({ show, onClose, userID }) => {
  const [userData, setUserData] = useState({
    username: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false); // New state variable for loading spinner

  const [user] = useAuthState(auth);
  useEffect(() => {
    const docRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      }
    });

    return () => unsubscribe();
  }, [userID]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", userID), userData);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="">
      <div
        className={`flex  justify-center items-center h-screen w-screen fixed top-0 left-0 overflow-hidden  bg-black bg-opacity-30 transition-opacity duration-300 z-[100]
         ${show ? "block" : "hidden"}`}
        //  onClick={onClose}
      >
        <div className="flex flex-col h-full bg-white max-h-[420px] w-full max-w-[550px] mx-auto rounded-md z-[60] p-4">
          <div className="flex items-center p-2">
            <span className="font-semibold text-[18px] max-w-[500px] mx-auto w-full flex justify-start">
              Update your account
            </span>
            <button onClick={onClose}>
              <ExitIcon />
            </button>
          </div>
          <div className="flex flex-col items-start justify-start p-2 gap-7">
            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <span className="font-medium text-[16px]">Username</span>
              <input
                type="text"
                value={userData.username}
                onChange={(e) =>
                  setUserData({ ...userData, username: e.target.value })
                }
                className="w-full max-w-[500px] border-[2px] border-black mx-auto h-[40px] rounded p-1 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <span className="font-medium text-[16px]">Bio</span>
              <textarea
                type="text"
                value={userData.bio}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
                className="w-full max-w-[500px] border-[2px] border-black mx-auto h-[100px] rounded p-1 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <button
                onClick={() => {
                  handleSave();
                }}
                className="w-full px-5 py-3 mt-5 text-white bg-black rounded focus:outline-none focus:ring-0"
              >

                {loading ? (
                  <div className="flex items-center justify-center ">
                    <svg
                      aria-hidden="true"
                      className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 "
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentFill"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#ff3040"
                      />
                    </svg>
                  </div>
                ) : (
"                Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
