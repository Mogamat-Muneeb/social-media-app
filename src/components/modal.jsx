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
import { ExitIcon } from "./icon";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import { config } from "../config/index";
const Modal = ({ show, onClose, userID }) => {
  const [userData, setUserData] = useState({
    userName: "",
    bio: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [showUpload, setShowUpload] = useState(false);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  // const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    const docRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      }
    });

    return () => unsubscribe();
  }, [userID]);

  const handleClickShowUpload = () => {
    setShowUpload(!showUpload);
  };

  // const handleSave = async () => {
  //   setLoading(true);
  //   setSaving(true);
  //   try {
  //     await updateDoc(doc(db, "users", userID), userData);
  //     const likesQuery = query(
  //       collection(db, "likes"),
  //       where("userId", "==", userID)
  //     );
  //     const likesSnapshot = await getDocs(likesQuery);
  //     likesSnapshot.forEach((doc) => {
  //       updateDoc(doc.ref, {
  //         userName: userData.userName,
  //         bio: userData.bio,
  //         photoURL: userData.photoURL,
  //       });
  //     });
  //     const postsQuery = query(
  //       collection(db, "posts"),
  //       where("userId", "==", userID)
  //     );
  //     const postsSnapshot = await getDocs(postsQuery);
  //     postsSnapshot.forEach((doc) => {
  //       updateDoc(doc.ref, {
  //         userName: userData.userName,
  //         bio: userData.bio,
  //         photoURL: userData.photoURL,
  //       });
  //     });

  //     setUploaded(false);
  //     setSaving(true);

  //     if (file) {
  //       const storageRef = ref(storage, `users/${userID}/${Date.now()}`);
  //       console.log(storageRef,"storageRef" );
  //       const uploadTask = uploadBytesResumable(storageRef, file);
  //       console.log(uploadTask, "uploadTask");

  //       uploadTask.on(
  //         "state_changed",
  //         (snapshot) => {
  //           const progress =
  //             (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //           setUploadProgress(progress);
  //           console.log(progress, "progress");
  //         },
  //         (error) => {
  //           console.log(error);
  //           setSaving(false);
  //           setLoading(false);
  //         },
  //         async () => {
  //           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  //           console.log(downloadURL, "downloadURL");
  //           setUploaded(true);
  //           setSaving(false);
  //           const userRef = doc(db, "users", userID);
  //           console.log("image upload fully");
  //           toast("mage upload fully", {
  //             ...config,
  //             type: "success",
  //           });
  //           updateDoc(userRef, {
  //             photoURL: downloadURL,
  //           });
  //           onClose();
  //           setLoading(false);
  //         }
  //       );
  //     } else {
  //       onClose();
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     setLoading(false);
  //   }
  // };

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
          userName: userData.userName,
          bio: userData.bio,
          photoURL: userData.photoURL,
        });
      });
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userID)
      );
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((doc) => {
        updateDoc(doc.ref, {
          userName: userData.userName,
          bio: userData.bio,
          photoURL: userData.photoURL,
        });
      });

      // Wait until image has been successfully uploaded
      if (file) {
        const storageRef = ref(storage, `users/${userID}/${Date.now()}`);
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
            toast("Image uploaded successfully", {
              ...config,
              type: "success",
            });
            updateDoc(userRef, {
              photoURL: downloadURL,
            });
            onClose();
            setLoading(false);
          }
        );
      } else {
        onClose();
        setLoading(false);
      }
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="">
      <div
        className={`flex  justify-center items-center h-screen w-screen fixed top-0 left-0 overflow-hidden  bg-black bg-opacity-30 transition-opacity duration-300 z-[100]
         ${show ? "block" : "hidden"}`}
      >
        <div className="flex flex-col h-full bg-white max-h-[600px] w-full max-w-[550px] mx-auto rounded-md z-[60] p-4">
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
              }}
            >
              <ExitIcon />
            </button>
          </div>
          <div className="flex flex-col items-start justify-start py-1 md:px-2">
            <div className="flex items-start justify-start gap-4 ">
              <img
                src={user?.photoURL || ""}
                alt={user?.displayName || ""}
                className="w-8 h-8 rounded-full md:w-10 md:h-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://i.postimg.cc/zfyc4Ftq/image.png";
                }}
              />
              <div className="flex flex-col items-start justify-start">
                <p className="text-[16px] font-medium">
                  {userData.userName
                    ? userData.userName
                    : userData.displayName
                        ?.split(" ")
                        .map(
                          (word) =>
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
              </div>
            </div>
            {showUpload && (
              <>
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center h-4 mt-5 mb-5 rounded-lg cursor-pointer w-52 "
                >
                  <div className="flex flex-col items-center justify-center px-1 py-5 md:px-2 md:py-4">
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
          <div className="flex flex-col items-start justify-start p-2 gap-7">
            <div className="flex flex-col items-start justify-start gap-2 max-w-[500px] mx-auto w-full">
              <span className="font-medium text-[16px]">userName</span>
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
                  " Save"
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
