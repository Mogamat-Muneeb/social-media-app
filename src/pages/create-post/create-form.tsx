import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
interface CreateFormData {
  //   title: string;
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

  const onPostSubmit = async (data: CreateFormData) => {
    if (file === "") {
      alert("Please add the file");
      return;
    }

    const storageRef = ref(storage, `posts/${user?.displayName}/${Date.now()}`);

    /* @ts-ignore */
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploaded(false);
    setSaving(true);
    setIsLoading(true);
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
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        addDoc(postsRef, {
          ...data,
          username: user?.displayName,
          userPp: user?.photoURL,
          userId: user?.uid,
          date: Date.now(),
          imageUrl: downloadURL,
        }).then(() => {
          setUploaded(true);
          setSaving(false);
          setIsLoading(false);
          navigate("/");
        });
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit(onPostSubmit)}
        className="max-w-[500px] w-full"
      >
        {show === "step1" && (
          <>
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <button
                type="button"
                disabled={!file}
                className="flex items-end justify-end w-full"
                onClick={() => setShowing("step2")}
              >
                next
              </button>
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-full  rounded-lg cursor-pointer bg-[#0095f6]"
              >
                <div className="flex flex-col items-center justify-center px-2 py-4">
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
            <div className="flex justify-end w-full gap-4">
              <button type="button" onClick={() => setShowing("step1")}>
                back
              </button>
              <button
                type="button"
                /* @ts-ignore */
                disabled={buttonDisabled}
                onClick={() => setShowing("step3")}
              >
                next
              </button>
            </div>
            <textarea
              placeholder="Write a caption."
              {...register("description")}
              value={description}
              onChange={handleChange2}
            />
            <p className="text-red-500"> {errors.description?.message}</p>
          </>
        )}
        {show === "step3" && (
          <div className="flex flex-col">
            <button type="submit" className="text-[#0095f6]">
              {isLoading ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </>
              ) : (
                "Share"
              )}
            </button>
            <button type="button" onClick={() => setShowing("step2")}>
              back
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
