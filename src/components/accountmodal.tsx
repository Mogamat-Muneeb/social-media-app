import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { ExitIcon, LoadingSpinner } from "./icon";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { toast } from "react-toastify";
import { config } from "../config/index";
const Modal = ({
  show,
  onClose,
  userID,
}: {
  show: any;
  onClose: any;
  userID: any;
}) => {
  const [userData, setUserData] = useState({
    userName: "",
    bio: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const docRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        //@ts-ignore
        setUserData(docSnapshot.data());
      }
    });

    return () => unsubscribe();
  }, [userID]);

  const handleClickShowUpload = (e: any) => {
    e.preventDefault();
    setShowUpload(!showUpload);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", userID), userData);
      const likesQuery = query(
        collection(db, "likes"),
        where("userId", "==", userID)
      );
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          photoURL: userData.photoURL,
          userName: userData.userName,
          bio: userData.bio,
        });
      });
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userID)
      );
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          photoURL: userData.photoURL,
          userName: userData.userName,
          bio: userData.bio,
        });
      });

      if (file) {
        const storageRef = ref(storage, `users/${userID}/${Date.now()}`);
        //@ts-ignore
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.log(error);
            setSaving(false);
            setLoading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploaded(true);
            const userRef = doc(db, "users", userID);
            await updateDoc(userRef, {
              photoURL: downloadURL,
            });
            await Promise.all([
              updateDoc(userRef, {
                userName: userData.userName,
                bio: userData.bio,
              }),
              likesSnapshot.forEach((doc) => {
                updateDoc(doc.ref, {
                  photoURL: downloadURL,
                  userName: userData.userName,
                  bio: userData.bio,
                });
              }),
              postsSnapshot.forEach((doc) => {
                updateDoc(doc.ref, {
                  photoURL: downloadURL,
                  userName: userData.userName,
                  bio: userData.bio,
                });
              }),
            ]);
            toast("Account updated successfully", {
              ...config,
              type: "success",
            });
            onClose();
            setLoading(false);
            //@ts-ignore
            setFile(null);
          }
        );
        await uploadTask;
      } else {
        onClose();
        setLoading(false);
        //@ts-ignore
        setFile(null);
      }
    } catch (error: any) {
      console.log(error.message);
      setLoading(false);
      //@ts-ignore
      setFile(null);
    }
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="">
      <div
        className={`flex  justify-center items-center h-screen w-screen fixed top-0 left-0 overflow-hidden  bg-black bg-opacity-70 transition-opacity duration-300 z-[100]
         ${show ? "block" : "hidden"}`}
      >
        <div className="flex flex-col h-full bg-white max-h-[450px] w-full max-w-[550px] mx-auto rounded-md z-[60] p-4">
          <div className="flex items-center p-2">
            <span className="font-semibold text-[18px] max-w-[500px] mx-auto w-full flex justify-start">
              Update your account
            </span>
            <button
              onClick={() => {
                onClose();
                if (!uploaded) {
                  return;
                }
                setShowUpload(!showUpload);
              }}
            >
              <ExitIcon />
            </button>
          </div>
          <div className="flex flex-col items-start justify-start py-1 md:px-2">
            <div className="flex items-center justify-start gap-4">
              <img
                src={userData.photoURL || user?.photoURL || ""}
                alt={user?.displayName || ""}
                className="object-cover w-8 h-8 rounded-full md:w-10 md:h-10"
                onError={(e) => {
                  //@ts-ignore
                  e.target.onerror = null;
                  //@ts-ignore
                  e.target.src = "https://i.postimg.cc/zfyc4Ftq/image.png";
                }}
              />
              <form className="flex flex-col items-start justify-start ">
                <p className="text-[16px] font-medium">
                  {userData.userName
                    ? userData.userName
                    : //@ts-ignore
                      userData.displayName
                        ?.split(" ")
                        .map(
                          (word: any) =>
                            word.substring(0, 1).toLowerCase() +
                            word.substring(1)
                        )
                        .join(" ")}
                </p>
                <button
                  className="text-[14px] font-medium"
                  onClick={handleClickShowUpload}
                >
                  {showUpload ? " Cancel" : " Change profile picture"}
                </button>
              </form>
            </div>
            {showUpload && (
              <>
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center h-4 mt-5 mb-5 cursor-pointer w-52 "
                >
                  <div className="flex flex-col items-center justify-center px-1 md:px-2 md:py-4">
                    <div className="flex items-center text-sm text-black">
                      <p className="flex items-center w-full mt-5 font-medium">
                        {file ? ` Image Uploaded ` : ` Upload a photo`}
                      </p>
                    </div>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    accept="/image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
          <div className="flex flex-col items-start justify-start gap-4 p-2">
            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <span className="font-medium text-[16px]">Username</span>
              <input
                type="text"
                value={userData.userName}
                onChange={(e) =>
                  setUserData({ ...userData, userName: e.target.value })
                }
                className="w-full max-w-[500px] border-[2px] border-black mx-auto h-[40px] rounded p-1 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <span className="font-medium text-[16px]">Bio</span>
              <textarea
                //@ts-ignore
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
                onClick={handleSave}
                className="w-full px-5 py-3 mt-3 text-white bg-black rounded focus:outline-none focus:ring-0"
              >
                {loading ? (
                  <div className="flex items-center justify-center ">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div> Save</div>
                )}
              </button>
              {/* {saving && <p>Saving...</p>} */}
              {/* {uploaded && <img src={imageUrl} alt="User Profile" />} */}
              {/* {uploadProgress > 0 && uploadProgress < 100 && (
                <p>Upload Progress: {uploadProgress}%</p>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
