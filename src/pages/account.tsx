import ProtectedRoute from "../components/ProtectedRoute";
import { auth, db } from "../config/firebase";
import { Link, Route, RouteProps, useParams } from "react-router-dom";
import { RectIcon, RectMobileIcon, LikedIcon } from "../components/icon";
import Modal from "../components/modal";

import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  where,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { Post as IPost } from "../pages/main/main";
import { Like } from "../pages/main/post";
export const Account = () => {
  interface UserData {
    displayName: string;
    email: string;
    otherData: string;
    photoURL: any;
    userName: any;
    bio: any;
    uid: any;
  }
  interface LikesCount {
    [postId: string]: number;
  }

  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user] = useAuthState(auth);
  const { uid } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [show, setShow] = useState(false);
  const [likesCount, setLikesCount] = useState<LikesCount>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPost, setHoveredPost] = useState();
  useEffect(() => {
    /* @ts-ignore */
    const docRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        /* @ts-ignore */
        setUserData(docSnapshot.data() as UserData);
      } else {
        console.log("No such document!");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleClick = (event: any) => {
    setShow(!show);
  };

  useEffect(() => {
    if (show) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [show]);

  useEffect(() => {
    const getPosts = async () => {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", uid),
        orderBy("date", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IPost[];
        /* @ts-ignore */
        setPosts(postsData);
      });

      const likesQuery = query(collection(db, "likes"));
      const likesUnsubscribe = onSnapshot(likesQuery, (likesSnapshot) => {
        const likesCount = {};
        likesSnapshot.forEach((doc) => {
          const postId = doc.data().postId;
          /* @ts-ignore */
          likesCount[postId] = likesCount[postId] ? likesCount[postId] + 1 : 1;
        });
        setLikesCount(likesCount);
      });

      return () => {
        unsubscribe();
        likesUnsubscribe();
      };
    };

    getPosts();
  }, [uid]);

  const closeToggle = () => setShow(!show);

  return (
    <ProtectedRoute>
      <Modal show={show} onClose={closeToggle} userID={user?.uid} />
      {isLoading ? (
        <div className="flex items-center justify-center h-screen mt-20">
          <svg
            aria-hidden="true"
            className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 f"
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
        <div
          className={`max-w-[1280px] w-full mx-auto 
          ${
            posts.length > 1
              ? "h-full  md:h-screen mb-20 "
              : "md:h-full  h-screen mb-20" && posts.length > 0
              ? "h-screen"
              : "h-screen" && isLoading
              ? "h-screen"
              : "h-screen"
          }
          `}
        >
          {userData && (
            <>
              <div className="hidden px-4 md:px-0 md:block">
                <div className="grid w-full grid-cols-1 gap-4 pt-10 md:grid-cols-2 ">
                  <div className="flex justify-center w-full md:justify-end">
                    <img
                      src={userData.photoURL}
                      alt=""
                      className="rounded-full md:w-[150px] md:h-[150px] w-[130px] h-[130px] shadow-lg object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start w-full gap-2">
                    <div className="flex flex-col items-start w-full ">
                      <div className="items-center hidden w-full gap-2 md:flex md:gap-10">
                        <div>
                          <p className="text-[20px] font-medium">
                            {userData.userName ? (
                              <>{userData.userName}</>
                            ) : (
                              <>{userData.displayName}</>
                            )}
                          </p>
                        </div>

                        <div>
                          {user && uid === user.uid && (
                            <button
                              className="p-[5px] w-[130px] text-white bg-black rounded hover:opacity-70"
                              onClick={(event) => {
                                event.preventDefault();
                                handleClick(event);
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full gap-2 md:hidden md:gap-10">
                        <div>
                          <p className="text-[20px] font-medium">
                            {userData.userName ? (
                              <>{userData.userName}</>
                            ) : (
                              <>{userData.displayName}</>
                            )}
                          </p>
                        </div>
                        <div>
                          {user && uid === user.uid && (
                            <button
                              className="p-[5px] w-[130px] text-white bg-black rounded hover:opacity-70"
                              onClick={(event) => {
                                event.preventDefault();
                                handleClick(event);
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[16px] font-medium">
                        {posts.length} posts
                      </p>
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-[16px] font-normal">
                        {userData.displayName}
                      </p>
                      <p className="text-[14px] font-normal text-start">
                        {userData.bio}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2  max-w-[1000px] mx-auto w-full flex-col pt-10">
                  <p className="flex flex-col items-center justify-center gap-1 font-medium text-[14px] uppercase ">
                    <span className="flex items-center">
                      <RectIcon />
                      Posts
                    </span>

                    {/* <span className="border-[0.1px] border-gray-400 w-full"></span> */}
                  </p>
                  <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-10  px-4 md:px-0">
                    {posts.map((post: IPost) => {
                      return (
                        <div key={post.id} className="relative">
                          {/* <Link to={`/posts/${post.id}`}> */}
                          <img
                            /* @ts-ignore */
                            key={post.id}
                            /* @ts-ignore */
                            src={post.imageUrl}
                            alt=""
                            className={`lg:w-[240px] lg:h-[240px] md:w-[200px] md:h-[200px] w-[150px] h-[150px] cursor-pointer object-cover shadow-lg `}
                          />
                          {/* </Link> */}

                          <p className="flex justify-center pt-2">
                            {likesCount[post.id] ? (
                              <>
                                {likesCount[post.id]}
                                <LikedIcon />
                              </>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col px-4 md:px-0 md:hidden">
                <div className="flex items-center w-full pt-10">
                  <div className=" w-[200px]">
                    <img
                      src={userData.photoURL}
                      alt=""
                      className="rounded-full  w-[130px] h-[130px] shadow-lg object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-start">
                    <p className="text-[16px] font-medium flex flex-col items-center">
                      <span>{posts.length} </span> <span>posts</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start pt-5">
                  <p className="text-[16px] font-medium ">
                    {userData.userName ? (
                      <>{userData.userName}</>
                    ) : (
                      <>{userData.displayName}</>
                    )}
                  </p>

                  <p className="text-[16px] font-normal">
                    {userData.displayName}
                  </p>

                  <p className="text-[14px] font-normal text-left">
                    {userData.bio}
                  </p>
                </div>
                <div className="flex flex-col justify-start pt-5">
                  {user && uid === user.uid && (
                    <button
                      className="p-[5px] w-[130px] text-white bg-black rounded hover:opacity-70"
                      onClick={(event) => {
                        event.preventDefault();
                        handleClick(event);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex gap-2  max-w-[1000px] mx-auto w-full flex-col pt-10">
                  <p className="flex items-center justify-center gap-1 font-medium ">
                    <RectMobileIcon />
                    Posts
                  </p>
                  <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-3  px-1">
                    {posts.map((post: IPost) => {
                      return (
                        <div
                          key={post.id}
                          className="flex flex-col justify-center"
                        >
                          <img
                            /* @ts-ignore */
                            key={post.id}
                            /* @ts-ignore */
                            src={post.imageUrl}
                            alt=""
                            className="md:w-[200px] md:h-[200px] w-[150px] h-[150px]  object-cover shadow-lg"
                          />
                          <p
                            className={`flex items-center justify-center w-full  ${
                              likesCount[post.id] === undefined
                                ? "pt-8 "
                                : "pt-2"
                            }`}
                          >
                            {likesCount[post.id] ? (
                              <>
                                {likesCount[post.id]}
                                <LikedIcon />
                              </>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
};
