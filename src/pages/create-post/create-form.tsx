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
          imageUrl: downloadURL, // add the download URL as a property to the document
        }).then(() => {
          setUploaded(true);
          setSaving(false);
          navigate("/"); // navigate to the home page after the post is saved
        });
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit(onPostSubmit)}>
        <div className="flex items-center justify-center w-full gap-1">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 "
          >
            <div className="flex flex-col items-center justify-center px-12 py-12">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">
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
        <textarea placeholder="Write a caption." {...register("description")} />
        <p className="text-red-500"> {errors.description?.message}</p>
        <button type="submit">Creat Post</button>
      </form>
    </div>
  );
};
