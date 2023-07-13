import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { LoadingSpinner } from "../../components/icon";

interface CreateFormData {
  description: string;
}

export const CreateForm = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [show, setShowing] = useState("step1");
  const [description, setDescription] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const schema = yup.object().shape({
    description: yup.string().required("You must add a description."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(schema),
  });

  const handleChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  useEffect(() => {
    if (description.trim().length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [description]);

  const postsRef = collection(db, "posts");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
      //@ts-ignore
    const docRef = doc(db, "users", user?.uid);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
          //@ts-ignore
        setUserData(docSnapshot.data());
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const onPostSubmit = async (data: CreateFormData) => {
    if (file === "") {
      alert("Please add the file");
      return;
    }

    const storageRef = ref(storage, `posts/${user?.displayName}/${Date.now()}`);
      //@ts-ignore
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploaded(false);
    setSaving(true);
    setIsLoading(true);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.log(error);
        setSaving(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const postDocRef = await addDoc(postsRef, {
          ...data,
            //@ts-ignore
          userName: userData?.userName ?? null,
            //@ts-ignore
          bio: userData?.bio ?? null,
            //@ts-ignore
          username: userData?.displayName ?? null,
            //@ts-ignore
          photoURL: userData?.photoURL,
            //@ts-ignore
          userId: userData?.uid,
          date: Date.now(),
          imageUrl: downloadURL,
        });

        const notificationsRef = collection(db, "notifications");
        const userNotificationsQuery = query(
          notificationsRef,
          where("postId", "==", postDocRef.id),
            //@ts-ignore
          where("userId", "==", userData?.uid)
        );
        const userNotificationsSnapshot = await getDocs(userNotificationsQuery);

        const lookedAt = !userNotificationsSnapshot.empty;

        await addDoc(notificationsRef, {
          postId: postDocRef.id,
            //@ts-ignore
          userId: userData?.uid,
             //@ts-ignore
          userName: userData?.userName ?? null,
             //@ts-ignore
          username: userData?.displayName ?? null,
          date: Date.now(),
          lookedAt: lookedAt,
          imageUrl: downloadURL,
          usage: "created a post"
        });

        setUploaded(true);
        setSaving(false);
        setIsLoading(false);
        navigate("/");
      }
    );
  };


  return (
    <div className="flex flex-wrap items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit(onPostSubmit)}
        className="md:max-w-[1280px] max-w-[600px] w-full mx-auto px-4 md:px-0"
      >
        {show === "step1" && (
          <>
            <div className="flex flex-col items-center justify-center w-full gap-4 mx-auto ">
              <button
                type="button"
                disabled={!file}
                className={`flex items-end justify-end w-full text-[#ff3040] font-semibold max-w-[500px]  ${
                  !file && "opacity-40 font-normal "
                }`}
                onClick={() => setShowing("step2")}
              >
                next
              </button>
              {file && (
                <div className="rounded shadow">
                  <img
                    src={
                      /* @ts-ignore */
                      URL.createObjectURL(file)
                    }
                    className="rounded shadow-lg  max-w-[500px] w-full  object-cover"
                    alt="Uploaded file"
                  />
                </div>
              )}
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center  h-full bg-black rounded-lg max-w-[500px] w-full cursor-pointer hover:opacity-70"
              >
                <div className="flex flex-col items-center justify-center px-1 py-5 md:px-2 md:py-4">
                  <p className="flex items-center text-sm text-white">
                    <span className="font-medium">
                      {file ? ` Image Uploaded ` : ` Click to upload`}
                    </span>
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  accept="/image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}
        {show === "step2" && (
          <>
            <div className="grid grid-cols-2   items-center  justify-center  mx-auto   w-full lg:max-w-[1000px] md:max-w-[500px] max-w-[500px]  h-full  gap-4 ">
              <div className="flex items-center justify-start w-full max-w-[500px] mx-auto "></div>
              <div className="flex items-end justify-end w-full gap-2  max-w-[500px] mx-auto">
                <button type="button" onClick={() => setShowing("step1")}>
                  back
                </button>
                {!buttonDisabled && (
                  <>
                    <button
                      type="submit"
                      className="text-[#ff3040] font-semibold"
                    >
                      {isLoading ? <LoadingSpinner /> : "Share"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1  md:max-w-[1000px] max-w-[500px] justify-center  mx-auto w-full h-full pt-5">
              <div className="w-full ">
                {file && (
                  <div className="">
                    <img
                      src={
                        /* @ts-ignore */
                        URL.createObjectURL(file)
                      }
                      className="w-full rounded-sm shadow-lg max-w-[500px]  object-cover mx-auto"
                      alt="Uploaded file"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-start w-full h-full max-w-[500px] mx-auto  ">
                <textarea
                  placeholder="Write a caption...."
                  {...register("description")}
                  value={description}
                  onChange={handleChange2}
                  className=" rounded w-full h-[200px] p-2 placeholder:text-[16px] placeholder:font-medium focus:ring-0 focus:outline-none"
                />
                <p className="text-red-500">{errors.description?.message}</p>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
