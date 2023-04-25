import ProtectedRoute from "../components/ProtectedRoute";
import { auth, db } from "../config/firebase";
import { Route, RouteProps, useParams } from "react-router-dom";
import { RectIcon } from "../components/icon";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  where,
  query,
  orderBy,
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
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);
  const { uid } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);

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

  useEffect(() => {
    const fetchPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", user?.uid),
        orderBy("date", "desc")
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
      
      <div className={`max-w-[1280px] w-full mx-auto ${userPosts.length > 4 ? "h-full  md:h-screen mb-20 " : "md:h-full  h-screen mb-20"}`}>
        {userData && (
          <div className="px-4 md:px-0">
            <div className="flex w-full gap-4 pt-10">
              <div className="flex justify-end w-full">
                <img
                  src={userData.photoURL}
                  alt=""
                  className="rounded-full md:w-[150px] md:h-[150px] w-[130px] h-[130px] shadow-lg"
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <p className="text-[20px] font-medium">
                  {userData.displayName}
                </p>
                <p className="text-[14px] font-normal">{userData.email}</p>
                <p className="text-[16px] font-medium">
                  {userPosts.length} posts
                </p>
              </div>
            </div>
            <div className="flex gap-2  max-w-[1000px] mx-auto w-full flex-col pt-10">
              <p className="flex items-center justify-center gap-1 font-medium uppercase ">
                <RectIcon />
                Posts
              </p>
              <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-10  px-4 md:px-0">
                {posts.map((post) => (
                  <img
                    /* @ts-ignore */
                    key={post.id}
                    /* @ts-ignore */
                    src={post.imageUrl}
                    alt=""
                    className="lg:w-[240px] lg:h-[240px] md:w-[200px] md:h-[200px] w-[150px] h-[150px]  object-cover shadow-lg"
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
