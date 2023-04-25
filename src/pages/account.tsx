import ProtectedRoute from "../components/ProtectedRoute";
import { auth, db } from "../config/firebase";
import { Route, RouteProps, useParams } from "react-router-dom";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  where,
  query,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { Post as IPost } from "../pages/main/main";
import { Post } from "./main/post";
export const Account = () => {
  interface UserData {
    displayName: string;
    email: string;
    otherData: string;
    photoURL: any;
  }

  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  console.log(userPosts, "userPosts");

  const [user] = useAuthState(auth); // assume that this context provides information about the current user

  /* @ts-ignore */
  const { uid } = useParams();
  console.log("uid:", uid);
  const [userData, setUserData] = useState<UserData | null>(null);
  /* @ts-ignore */
  console.log(userData, "userData");

  const [isEditable, setIsEditable] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      /* @ts-ignore */
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        /* @ts-ignore */
        setUserData(docSnap.data() as UserData);
      } else {
        console.log("No such document!");
      }
    };

    fetchUserData();
  }, [uid]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const userPostsQuery = query(
        collection(db, "posts"),
        where("userId", "==", user?.uid)
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);
      const userPostsData = userPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IPost[];
      setUserPosts(userPostsData);
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const [posts, setPosts] = useState([]);
  console.log(posts, "post");

  useEffect(() => {
    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", user?.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      /* @ts-ignore */
      setPosts(postsData);
    };
    fetchPosts();
    /* @ts-ignore */
  }, [user]);
  return (
    <ProtectedRoute>
      {/* account: {uid} */}
      <div className="max-w-[1280px] w-full mx-auto">
        {userData && (
          <div className="">
            <div className="flex w-full gap-4 pt-10">
              <div className="flex justify-end w-full">
                <img
                  src={userData.photoURL}
                  alt=""
                  className="rounded-full w-[150px] h-[150px]"
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <p> {userData.displayName}</p>
                <p>{userData.email}</p>
                <p>{userPosts.length} posts</p>
              </div>
            </div>
            <div className="flex gap-2  max-w-[1000px] mx-auto w-full flex-col pt-10">
              <p className="flex items-center justify-center gap-1 font-medium uppercase ">
                <svg
                  aria-label=""
                  className="_ab6-"
                  color="rgb(245, 245, 245)"
                  fill="rgb(245, 245, 245)"
                  height="12"
                  role="img"
                  viewBox="0 0 24 24"
                  // width="12"
                >
                  <rect
                    fill="none"
                    height="18"
                    stroke="black"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    width="18"
                    x="3"
                    y="3"
                  ></rect>
                  <line
                    fill="none"
                    stroke="black"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    x1="9.015"
                    x2="9.015"
                    y1="3"
                    y2="21"
                  ></line>
                  <line
                    fill="none"
                    stroke="black"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    x1="14.985"
                    x2="14.985"
                    y1="3"
                    y2="21"
                  ></line>
                  <line
                    fill="none"
                    stroke="black"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    x1="21"
                    x2="3"
                    y1="9.015"
                    y2="9.015"
                  ></line>
                  <line
                    fill="none"
                    stroke="black"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    x1="21"
                    x2="3"
                    y1="14.985"
                    y2="14.985"
                  ></line>
                </svg>
                Posts
              </p>
              <div className="flex gap-2 max-w-[1000px] mx-auto w-full pt-10">
                {posts.map((post) => (
                  <img
                    /* @ts-ignore */
                    key={post.id}
                    /* @ts-ignore */
                    src={post.imageUrl}
                    alt=""
                    className="w-[250px] h-[250px] object-cover shadow-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};
