import ProtectedRoute from "../components/ProtectedRoute";
import { auth, db, storage } from "../config/firebase";
import { useParams } from "react-router-dom";
import {
  RectIcon,
  LikedIcon,
  UnSavedIcon,
  LoadingSpinner,
} from "../components/icon";
import AccountModal from "../components/accountmodal";
import {
  doc,
  collection,
  where,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { Post as IPost } from "../pages/main/main";
import { deleteObject, ref } from "firebase/storage";
import { Modal } from "../components/modal";
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
  const [user] = useAuthState(auth);
  const { uid } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [show, setShow] = useState(false);
  const [likesCount, setLikesCount] = useState<LikesCount>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [postId, setPostId] = useState<string>("");
  const [storageRef, setStorageRef] = useState<string>("");
  const [tab, setTab] = useState("Posts");

  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const followingRef = collection(db, "following");
  const followingDocRef = doc(followingRef, user?.uid);
  console.log(followers.length, "followers");
  console.log(following.length, "following");

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

  useEffect(() => {
    if (uid) {
      const q = query(collection(db, "saved"), where("userId", "==", uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.data());
        /* @ts-ignore */
        setSavedPosts(data);
      });
      return unsubscribe;
    }
  }, []);

  const deletePost = async (postId: string, storageRef: string) => {
    try {
      const postDocRef = doc(db, "posts", postId);
      const savedQuerySnapshot = await getDocs(
        query(collection(db, "saved"), where("postId", "==", postId))
      );
      const deletePromises = [
        deleteDoc(postDocRef),
        ...savedQuerySnapshot.docs.map((doc) => deleteDoc(doc.ref)),
      ];
      await Promise.all(deletePromises);
      const postImageRef = ref(storage, storageRef);
      await deleteObject(postImageRef);
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  const handleDelete = async (postId: string, storageRef: string) => {
    await deletePost(postId, storageRef);
    setShowModal(false);
  };

  const handleToggleClick = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showModal]);

  useEffect(() => {
    const unsubscribe = onSnapshot(followingDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const followingData = docSnapshot.data();
        if (followingData && Array.isArray(followingData.following)) {
          setFollowing(followingData.following);
        } else {
          setFollowing([]);
        }
      } else {
        setFollowing([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(followingRef, (querySnapshot) => {
      const followersList: string[] = [];

      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          const followingData = doc.data();
          if (
            followingData &&
            Array.isArray(followingData.following) &&
            followingData.following.includes(user?.uid)
          ) {
            followersList.push(doc.id);
          }
        }
      });

      setFollowers(followersList);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);
  return (
    <ProtectedRoute>
      <AccountModal show={show} onClose={closeToggle} userID={user?.uid} />
      {showModal && user && uid === user.uid && (
        <Modal title="Comments Modal" toggleClick={handleToggleClick}>
          <div className="bg-white h-[150px] w-[350px] px-4 rounded">
            <p className="pt-5 font-medium">
              Are you sure you want to delete this post?
            </p>
            <div>
              {user && uid === user.uid && (
                <div className="flex justify-center gap-4 pt-10">
                  <button
                    onClick={() => handleDelete(postId, storageRef)}
                    className="font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleToggleClick}
                    className="font-medium text-[#ff3040]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen mt-20">
          <LoadingSpinner />
        </div>
      ) : (
        <div
          className={`max-w-[1280px] w-full mx-auto 
          ${
            posts.length > 1
              ? "h-full  md:h-screen mb-20 "
              : "md:h-full  h-screen mb-20" && posts.length < 0
              ? "h-full"
              : "h-screen" && isLoading
              ? "h-screen"
              : "h-screen" && posts.length === 1
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
                      className="rounded-full md:w-[200px] md:h-[200px] w-[130px] h-[130px] shadow-lg object-cover"
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
                      <div className="flex items-center gap-4 pt-[10px]">
                        <p className="text-[16px] font-medium">
                          {posts.length} posts
                        </p>
                        <p className="text-[16px] font-medium">
                          {followers.length} followers
                        </p>
                        <p className="text-[16px] font-medium">
                          {following.length} following
                        </p>
                      </div>
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
                <div className="flex justify-center gap-10 pt-10">
                  <button onClick={() => setTab("Posts")}>
                    <span
                      className={`flex items-center ${
                        tab === "Posts" && "text-blue-500"
                      }`}
                    >
                      <RectIcon
                        height={20}
                        color={`${tab === "Posts" ? "#3b82f6" : "black"}`}
                      />
                      Posts
                    </span>
                  </button>
                  {user && uid === user.uid && (
                    <button onClick={() => setTab("Saved")}>
                      <span
                        className={`flex items-center ${
                          tab === "Saved" && "text-blue-500"
                        }`}
                      >
                        <UnSavedIcon
                          width={20}
                          height={30}
                          color={`${tab === "Saved" ? "#3b82f6" : "black"}`}
                        />
                        Saved
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex gap-2  max-w-[1000px] mx-auto w-full flex-col pt-10">
                  {tab === "Posts" && (
                    <>
                      <p className="flex flex-col items-center justify-center gap-1 font-medium text-[14px] uppercase "></p>
                      <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-10  px-4 md:px-0">
                        {posts.map((post: IPost) => {
                          return (
                            <div key={post.id} className="relative">
                              <div className="group">
                                <img
                                  key={post.id}
                                  src={post.imageUrl}
                                  alt=""
                                  className="lg:w-[240px] lg:h-[240px] md:w-[200px] md:h-[200px] w-[150px] h-[150px] cursor-pointer object-cover shadow-lg"
                                />
                                <div className="absolute top-0 left-0 items-center justify-center hidden w-full h-full text-white opacity-100 overlay group-hover:flex group-hover:flex-col">
                                  {likesCount[post.id] && (
                                    <div>
                                      <span className="flex items-center gap-1 mr-1 font-medium">
                                        {likesCount[post.id]}
                                        <LikedIcon styling={"w-6 h-6"} />
                                      </span>
                                    </div>
                                  )}
                                  {user && uid === user.uid && (
                                    <button
                                      onClick={() => {
                                        setPostId(post.id);
                                        setStorageRef(post.imageUrl);
                                        handleToggleClick();
                                      }}
                                      className="pt-4 font-medium"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {tab === "Saved" && (
                    <>
                      <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-10  px-4 md:px-0">
                        {savedPosts.map((saved) => (
                          /* @ts-ignore */
                          <div key={saved.id}>
                            <img
                              /* @ts-ignore */
                              src={saved.imageUrl}
                              alt=""
                              className="lg:w-[240px] lg:h-[240px] md:w-[200px] md:h-[200px] w-[150px] h-[150px] cursor-pointer object-cover shadow-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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
                  <div className="flex justify-center gap-10 ">
                    <button onClick={() => setTab("Posts")}>
                      <span className="flex items-center">
                        <RectIcon
                          height={20}
                          color={`${tab === "Posts" ? "#3b82f6" : "black"}`}
                        />
                      </span>
                    </button>

                    {user && uid === user.uid && (
                      <button onClick={() => setTab("Saved")}>
                        <span className="flex items-center">
                          <UnSavedIcon
                            width={20}
                            height={30}
                            color={`${tab === "Saved" ? "#3b82f6" : "black"}`}
                          />
                        </span>
                      </button>
                    )}
                  </div>
                  {tab === "Posts" && (
                    <>
                      <p className="flex items-center justify-center gap-1 font-medium ">
                        {/* <RectMobileIcon /> */}
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
                                className={`flex flex-col items-center justify-center w-full  ${
                                  likesCount[post.id] === undefined
                                    ? "pt-8 "
                                    : "pt-2"
                                }`}
                              >
                                {likesCount[post.id] ? (
                                  <>
                                    {likesCount[post.id]}
                                    <LikedIcon styling={"w-6 h-6"} />
                                  </>
                                ) : (
                                  ""
                                )}
                                {user && uid === user.uid && (
                                  <button
                                    onClick={() => handleToggleClick()}
                                    className="font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {tab === "Saved" && (
                    <>
                      <h2> Saved</h2>
                      <div className="flex gap-2 max-w-[1000px] flex-wrap mx-auto w-full pt-3  px-1">
                        {savedPosts.map((saved) => (
                          /* @ts-ignore */
                          <div key={saved.id}>
                            <img
                              /* @ts-ignore */
                              src={saved.imageUrl}
                              alt=""
                              className="md:w-[200px] md:h-[200px] w-[150px] h-[150px]  object-cover shadow-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
};
