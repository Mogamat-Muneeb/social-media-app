import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [show, setShowing] = useState("step1");
  const schema = yup.object().shape({
    description: yup.string().required("You must add a description."),
  });

  console.log(uploadProgress, "uploadProgress");

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

  const postsRef = collection(db, "posts");

  const onPostSubmit = async (data: CreateFormData) => {
    if (file === "") {
      alert("Please add the file");
      return;
    }

    const storageRef = ref(storage, `posts/${user?.displayName}`);
    /* @ts-ignore */
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploaded(false);
    setSaving(true);
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
          navigate("/"); 
        });
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit(onPostSubmit)} className="max-w-[500px] w-full">
        {show === "step1" && (
          <>
            <div className="flex flex-col items-center justify-center w-full gap-4">
            <button type="button" disabled={!file} className="flex items-end justify-end w-full" onClick={() => setShowing("step2")}>
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
            <button type="button"     onClick={() => setShowing("step3")}>
              next
            </button>

            </div>
            <textarea
              placeholder="Write a caption."
              {...register("description")}
            />
            <p className="text-red-500"> {errors.description?.message}</p>
          </>
        )}
        {show === "step3" && (
          <>
            <button type="submit" className="text-[#0095f6]">
              Share
            </button>
            <button type="button" onClick={() => setShowing("step2")}>
              back
            </button>
          </>
        )}
      </form>
    </div>
  );
};
