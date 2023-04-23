import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    console.log(result);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center rounded-md shadow">
        <div className="flex flex-col h-full gap-4 p-10 rounded shadow">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-[24px]"> Sign In / Sign Up</p>
            <span className="border-t-[1px] border-r-0 border-b-0 border-gray-400"></span>
          </div>

          <div className="border-[1px] border-gray-400 rounded-md w-[300px] flex justify-center">
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-3 p-3"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.171 8.368h-.67v-.035H10v3.333h4.709A4.998 4.998 0 0 1 5 10a5 5 0 0 1 5-5c1.275 0 2.434.48 3.317 1.266l2.357-2.357A8.295 8.295 0 0 0 10 1.667a8.334 8.334 0 1 0 8.171 6.7Z"
                  fill="#FFC107"
                ></path>
                <path
                  d="M2.628 6.121 5.366 8.13A4.998 4.998 0 0 1 10 4.999c1.275 0 2.434.482 3.317 1.267l2.357-2.357A8.295 8.295 0 0 0 10 1.667 8.329 8.329 0 0 0 2.628 6.12Z"
                  fill="#FF3D00"
                ></path>
                <path
                  d="M10 18.333a8.294 8.294 0 0 0 5.587-2.163l-2.579-2.183A4.963 4.963 0 0 1 10 15a4.998 4.998 0 0 1-4.701-3.311L2.58 13.783A8.327 8.327 0 0 0 10 18.333Z"
                  fill="#4CAF50"
                ></path>
                <path
                  d="M18.171 8.368H17.5v-.034H10v3.333h4.71a5.017 5.017 0 0 1-1.703 2.321l2.58 2.182c-.182.166 2.746-2.003 2.746-6.17 0-.559-.057-1.104-.162-1.632Z"
                  fill="#1976D2"
                ></path>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
