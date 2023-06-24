import { auth, provider, db } from "../config/firebase";
import { sendEmailVerification, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { GoogleIcon } from "../components/icon";

export const Login = () => {
  const navigate = useNavigate();
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", result.user.uid);
    const docSnapshot = await getDoc(userRef);

    if (!docSnapshot.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
      await sendEmailVerification(result.user);
    }
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center ">
        <div className="flex flex-col h-full gap-4 p-10">
          <div className="flex flex-col items-center justify-center gap-2">
            <h1 className="font-bold text-[24px]">
              Welcome to
              <span className="text-[#ff3040] px-1">Circledop !!</span>
            </h1>
            <span className="text-[14px]">Easy Signup Now</span>
          </div>
          <div className="border-[1px] border-gray-400 rounded-md w-[300px] flex justify-center">
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center w-full gap-3 py-3 "
            >
              <GoogleIcon />
              Sign in or up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
