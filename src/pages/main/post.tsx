import {
  addDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../../config/firebase";
import { Post as IPost } from "./main";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../../config/index";
import { Modal } from "../../components/modal";
import {
  UnLikedIcon,
  LikedIcon,
  SavedIcon,
  UnSavedIcon,
  LoadingSpinner,
} from "../../components/icon";
import { RxCross2 } from "react-icons/rx";
interface Props {
  post: IPost;
}

interface UserData {
  displayName: string;
  email: string;
  otherData: string;
  photoURL: any;
  userName: any;
  bio: any;
  uid: any;
}

export interface Like {
  likeId: string;
  userId: string;
  nameId: string | null;
  emailId: string | null;
  postId: string;
  userName: string | null;
}
export interface Saved {
  savedId: string;
  userId: string;
  postId: string;
  imageUrl: any;
}

export const Post = (props: Props) => {
  const { post } = props;
  const [user] = useAuthState(auth);
  const [likes, setLikes] = useState<Like[] | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const likesRef = collection(db, "likes");
  const USER_ID = user?.uid;

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const followingRef = collection(db, "following");
  const followingDocRef = user ? doc(followingRef, user.uid) : null;

  const followUser = async (userId: string) => {
    try {
      if (!followingDocRef) {
        // console.error("No user is logged in.");
        return;
      }

      const followingDoc = await getDoc(followingDocRef);

      if (!followingDoc.exists()) {
        await setDoc(followingDocRef, { following: [userId] });
      } else {
        await updateDoc(followingDocRef, {
          following: arrayUnion(userId),
        });
      }

      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      if (!followingDocRef) {
        // console.error("No user is logged in.");
        return;
      }

      await updateDoc(followingDocRef, {
        following: arrayRemove(userId),
      });
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  useEffect(() => {
    if (!followingDocRef) {
      // console.error("No user is logged in.");
      return;
    }

    const unsubscribe = onSnapshot(followingDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const followingData = docSnapshot.data();
        setIsFollowing(
          followingData && Array.isArray(followingData.following)
            ? followingData.following.includes(post.userId)
            : false
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const likesDoc = useMemo(
    () => query(likesRef, where("postId", "==", post?.id)),
    [post.id]
  );
  const savedRef = useMemo(
    () =>
      query(
        collection(db, "saved"),
        where("postId", "==", post?.id),
        where("userId", "==", USER_ID ?? "")
      ),
    [post?.id, USER_ID]
  );
  const addSaved = async () => {
    try {
      const newDoc = await addDoc(collection(db, "saved"), {
        userId: USER_ID,
        postId: post?.id,
        imageUrl: post?.imageUrl,
      });
      setIsSaved(true);
    } catch (err) {
      toast("Please login to save", {
        ...config,
        type: "error",
      });
      console.log(err);
    }
  };

  const removeSaved = async () => {
    try {
      const savedToDeleteQuery = query(
        collection(db, "saved"),
        where("postId", "==", post.id ?? null),
        where("userId", "==", USER_ID ?? null)
      );
      const savedToDeleteData = await getDocs(savedToDeleteQuery);
      const savedId = savedToDeleteData.docs[0].id;
      const savedToDelete = doc(db, "saved", savedId);
      await deleteDoc(savedToDelete);

      setIsSaved(false);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (user && user.uid) {
      const checkSaved = async () => {
        const savedData = await getDocs(savedRef);
        setIsSaved(!savedData.empty);
      };
      checkSaved();
    } else {
      setIsSaved(false);
    }
  }, [user]);

  const getLikes = async () => {
    const unsubscribe = onSnapshot(likesDoc, (snapshot) => {
      const likes = snapshot.docs.map((doc) => ({
        userId: doc.data().userId,
        likeId: doc.id,
        nameId: doc.data().nameId,
        emailId: doc.data().emailId,
        postId: doc.data().postId,
        userName: doc.data().userName,
        photoURL: doc.data().photoURL,
      }));

      setLikes(likes);
    });

    return unsubscribe;
  };

  const addLike = async () => {
    try {
      const newDoc = addDoc(likesRef, {
        userId: USER_ID,
        postId: post.id,
        nameId: user?.displayName ?? null,
        emailId: user?.email ?? null,
        /* @ts-ignore */
        userName: user?.userName ?? null,
      });
      if (user) {
        setLikes((prev) =>
          prev
            ? [
                ...prev,
                {
                  userId: user.uid,
                  /* @ts-ignore */
                  likeId: newDoc.id,
                  nameId: user.displayName ?? null,
                  emailId: user.email ?? null,
                  postId: post.id,
                  /* @ts-ignore */
                  userName: post.userName ?? null,
                },
              ]
            : [
                {
                  userId: user.uid,
                  /* @ts-ignore */
                  likeId: newDoc.id,
                  nameId: user.displayName ?? null,
                  emailId: user.email ?? null,
                  postId: post.id,
                  /* @ts-ignore */
                  userName: post.userName ?? null,
                },
              ]
        );
        // !!Notifications
        const notificationsRef = collection(db, "notifications");
        const userNotificationsQuery = query(
          notificationsRef,
          where("postId", "==", post.id),
          //@ts-ignore
          where("userId", "==", userData?.uid)
        );
        const userNotificationsSnapshot = await getDocs(userNotificationsQuery);

        const lookedAt = !userNotificationsSnapshot.empty;

        await addDoc(notificationsRef, {
          postId: post.id,
          //@ts-ignore
          userId: userData?.uid,
          //@ts-ignore
          userName: userData?.userName ?? null,
          //@ts-ignore
          username: userData?.displayName ?? null,
          date: Date.now(),
          lookedAt: lookedAt,
          imageUrl: "",
          usage: "liked your post",
        });
      }
    } catch (err) {
      toast("Please login to like", {
        ...config,
        type: "error",
      });
      console.log(err);
    }
  };

  // const removeLike = async () => {
  //   try {
  //     const likeToDeleteQuery = query(
  //       likesRef,
  //       where("postId", "==", post.id),
  //       where("userId", "==", USER_ID)
  //     );

  //     const likeToDeleteData = await getDocs(likeToDeleteQuery);
  //     const likeId = likeToDeleteData.docs[0].id;
  //     const likeToDelete = doc(db, "likes", likeId);
  //     await deleteDoc(likeToDelete);
  //     if (user) {
  //       setLikes(
  //         (prev) => prev && prev.filter((like) => like.likeId !== likeId)
  //       );
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", USER_ID)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
      await deleteDoc(likeToDelete);

      // Remove the corresponding notification
      const notificationsRef = collection(db, "notifications");
      const notificationQuery = query(
        notificationsRef,
        where("postId", "==", post.id),
        where("userId", "==", USER_ID)
      );
      const notificationSnapshot = await getDocs(notificationQuery);

      notificationSnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });

      if (user) {
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const hasUserLiked = likes?.find((like) => like.userId === USER_ID);

  useEffect(() => {
    getLikes();
  }, []);

  const currentDate = new Date();
  const postDate = new Date(post.date);
  //@ts-ignore
  const diffInMinutes = Math.floor((currentDate - postDate) / (1000 * 60));

  let timeAgo;

  if (diffInMinutes >= 43200) {
    const diffInMonths = Math.floor(diffInMinutes / 43200);
    timeAgo = `${diffInMonths}m`;
  } else if (diffInMinutes >= 1440) {
    const diffInDays = Math.floor(diffInMinutes / 1440);
    timeAgo = `${diffInDays}d`;
  } else if (diffInMinutes >= 60) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    timeAgo = `${diffInHours}h`;
  } else {
    timeAgo = `${diffInMinutes}m`;
  }

  const [loading, setLoading] = useState(true);

  const commentsRef = collection(db, "comments");

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", post.id),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newComments = querySnapshot.docs.map((doc) =>
        doc.data()
      ) as Comment[];
      setComments(newComments);
    });

    return unsubscribe;
  }, [post.id]);
  const uid = USER_ID;
  useEffect(() => {
    if (!uid) {
      return;
    }

    const docRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();

        setUserData(docSnapshot.data() as UserData);
        if (!userData || !Array.isArray(userData.myArray)) {
          return;
        }
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [USER_ID]);

  const [newCommentText, setNewCommentText] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim() === "") {
      return;
    }
    try {
      const newComment = {
        userId: USER_ID ?? "",
        postId: post.id,
        commentText: newCommentText,
        date: Date.now(),
        userName: userData?.userName ?? null,
        displayName: user?.displayName ?? null,
      };

      await addDoc(commentsRef, newComment);
      setNewCommentText("");
    } catch (error) {
      console.log("Error adding comment: ", error);
    }
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

  return (
    <>
      {showModal && (
        <Modal title="Comments Modal" toggleClick={handleToggleClick}>
          <div className="md:block hidden bg-white rounded  min-h-[500px] max-w-[1220px] w-full max-auto">
            <div className="grid w-full lg:grid-cols-2 md:grid-cols-1">
              <div className="hidden w-full rounded-l md:block">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="
                  min-w-[405px]  object-cover rounded-l"
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              </div>
              <div className="max-w-full min-w-[405px] p-3">
                <div className="flex justify-between w-full ">
                  <div className="flex items-center gap-2">
                    <Link to={`${post.userId}`}>
                      {post.photoURL ? (
                        <>
                          <img
                            src={`${post.photoURL}?${new Date().getTime()}`}
                            className="object-cover border rounded-full shadow w-9 h-9"
                            alt=""
                            key={Date.now()}
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={post.userPp}
                            className="object-cover border rounded-full shadow w-9 h-9"
                            alt=""
                          />
                        </>
                      )}
                    </Link>
                    <Link to={`${post.userId}`} className="text-[14px]">
                      {post.userName
                        ? post.userName
                        : post.username
                            ?.split(" ")
                            .map(
                              (word) =>
                                word.substring(0, 1).toLowerCase() +
                                word.substring(1)
                            )
                            .join(" ")}
                    </Link>
                  </div>
                  <button onClick={handleToggleClick}>
                    <RxCross2 />
                  </button>
                </div>
                <div className="max-h-[450px] h-full overflow-x-scroll mt-6 z-[100] no-scrollbar">
                  {comments.map((comment) => (
                    /* @ts-ignore */
                    <div key={comment.id}>
                      <div
                        className="flex items-center gap-1 "
                        onClick={handleToggleClick}
                      >
                        <p className=" font-semibold  text-[13px]">
                          {/* @ts-ignore */}
                          {comment?.userName}
                        </p>
                        <p className="font-normal  text-[13px]">
                          {/* @ts-ignore */}
                          {comment?.commentText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between w-full pt-3">
                  {likes ? (
                    <div className="flex flex-col">
                      <div className="flex items-center w-full gap-3">
                        <button
                          className=""
                          onClick={hasUserLiked ? removeLike : addLike}
                        >
                          {hasUserLiked ? (
                            <>
                              <LikedIcon
                                styling={"w-6 h-6"}
                                color={"#ff3040"}
                              />
                            </>
                          ) : (
                            <>
                              <UnLikedIcon styling={"w-6 h-6"} />
                            </>
                          )}
                        </button>

                        <p
                          className={`font-semibold  text-[14px]  ${
                            likes.length === 0 && "hidden"
                          }`}
                        >
                          {likes.length} likes
                        </p>
                      </div>
                      <div className="flex items-center text-[14px] gap-1 ">
                        {likes.length > 0 && (
                          <h2>
                            {likes.length === 1 ? (
                              <>
                                <span className="p-[3px]">Liked by </span>
                                {likes[0].userId === USER_ID
                                  ? "You"
                                  : likes[0].userName || likes[0].nameId || ""}
                              </>
                            ) : likes.length === 2 ? (
                              <>
                                <span className="p-[3px]">Liked by </span>
                                {likes[0].userId === USER_ID
                                  ? "You"
                                  : likes[0].userName || likes[0].nameId || ""}
                                and
                                {likes[1].userId === USER_ID
                                  ? "you"
                                  : likes[1].userName || likes[1].nameId || ""}
                              </>
                            ) : (
                              <>
                                <span className="p-[3px]">{`Liked by ${likes.length} people including `}</span>
                                {likes.some((like) => like.userId === USER_ID)
                                  ? "you"
                                  : `${
                                      likes[0].userName || likes[0].nameId || ""
                                    } and ${likes.length - 1} others`}
                              </>
                            )}
                          </h2>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className=""
                        onClick={hasUserLiked ? removeLike : addLike}
                      >
                        {hasUserLiked ? (
                          <>
                            <LikedIcon styling={"w-6 h-6"} color={"#ff3040"} />
                          </>
                        ) : (
                          <>
                            <UnLikedIcon styling={"w-6 h-6"} />
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {isSaved ? (
                    <button onClick={removeSaved}>
                      <SavedIcon width={20} height={30} />
                    </button>
                  ) : (
                    <button onClick={addSaved}>
                      <UnSavedIcon width={20} height={30} color={"black"} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden  block bg-white rounded  min-h-[500px]">
            <div className="grid w-full lg:grid-cols-2 md:grid-cols-1">
              <div className="max-w-[500px] min-w-[400px] p-3">
                <div className="flex justify-between w-full ">
                  <div className="flex items-center gap-2">
                    <Link to={`${post.userId}`}>
                      {post.photoURL ? (
                        <>
                          <img
                            src={`${post.photoURL}?${new Date().getTime()}`}
                            className="object-cover border rounded-full shadow w-9 h-9"
                            alt=""
                            key={Date.now()}
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={post.userPp}
                            className="object-cover border rounded-full shadow w-9 h-9"
                            alt=""
                          />
                        </>
                      )}
                    </Link>
                    <Link to={`${post.userId}`} className="text-[14px]">
                      {post.userName
                        ? post.userName
                        : post.username
                            ?.split(" ")
                            .map(
                              (word) =>
                                word.substring(0, 1).toLowerCase() +
                                word.substring(1)
                            )
                            .join(" ")}
                    </Link>
                  </div>
                  <button onClick={handleToggleClick}>
                    <RxCross2 />
                  </button>
                </div>
                <div className="max-h-[500px] min-h-[500px] h-full overflow-x-scroll mt-6 z-[100] no-scrollbar">
                  {comments.map((comment) => (
                    /* @ts-ignore */
                    <div key={comment.id}>
                      <div
                        className="flex items-center gap-1 "
                        onClick={handleToggleClick}
                      >
                        <p className=" font-semibold  text-[13px]">
                          {/* @ts-ignore */}
                          {comment?.userName}
                        </p>
                        <p className="font-normal  text-[13px]">
                          {/* @ts-ignore */}
                          {comment?.commentText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between w-full pt-3">
                  {likes ? (
                    <div className="flex flex-col">
                      <div className="flex items-center w-full gap-3">
                        <button
                          className=""
                          onClick={hasUserLiked ? removeLike : addLike}
                        >
                          {hasUserLiked ? (
                            <>
                              <LikedIcon
                                styling={"w-6 h-6"}
                                color={"#ff3040"}
                              />
                            </>
                          ) : (
                            <>
                              <UnLikedIcon styling={"w-6 h-6"} />
                            </>
                          )}
                        </button>

                        <p
                          className={`font-semibold  text-[14px]  ${
                            likes.length === 0 && "hidden"
                          }`}
                        >
                          {likes.length} likes
                        </p>
                      </div>
                      <div className="flex items-center text-[14px] gap-1 ">
                        {likes.length > 0 && (
                          <h2>
                            {likes.length === 1 ? (
                              <>
                                <span className="p-[3px]">Liked by </span>
                                {likes[0].userId === USER_ID
                                  ? "You"
                                  : likes[0].userName || likes[0].nameId || ""}
                              </>
                            ) : likes.length === 2 ? (
                              <>
                                <span className="p-[3px]">Liked by </span>
                                {likes[0].userId === USER_ID
                                  ? "You"
                                  : likes[0].userName || likes[0].nameId || ""}
                                and
                                {likes[1].userId === USER_ID
                                  ? "you"
                                  : likes[1].userName || likes[1].nameId || ""}
                              </>
                            ) : (
                              <>
                                <span className="p-[3px]">{`Liked by ${likes.length} people including `}</span>
                                {likes.some((like) => like.userId === USER_ID)
                                  ? "you"
                                  : `${
                                      likes[0].userName || likes[0].nameId || ""
                                    } and ${likes.length - 1} others`}
                              </>
                            )}
                          </h2>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className=""
                        onClick={hasUserLiked ? removeLike : addLike}
                      >
                        {hasUserLiked ? (
                          <>
                            <LikedIcon styling={"w-6 h-6"} color={"#ff3040"} />
                          </>
                        ) : (
                          <>
                            <UnLikedIcon styling={"w-6 h-6"} />
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {isSaved ? (
                    <button onClick={removeSaved}>
                      <SavedIcon width={20} height={30} />
                    </button>
                  ) : (
                    <button onClick={addSaved}>
                      <UnSavedIcon width={20} height={30} color={"black"} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex flex-col items-center justify-center px-2 mt-10 md:px-0">
        <div className="max-w-[450px] w-full flex flex-col border-[1px] rounded   h-full">
          <div className="flex flex-col w-full gap-2 p-2 text-start">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Link to={`/user/${post.userId}`}>
                  {post.photoURL ? (
                    <>
                      <img
                        src={`${post.photoURL}?${new Date().getTime()}`}
                        className="object-cover border rounded-full shadow w-9 h-9"
                        alt=""
                        key={Date.now()}
                      />
                    </>
                  ) : (
                    <>
                      <img
                        src={post.userPp}
                        className="object-cover border rounded-full shadow w-9 h-9"
                        alt=""
                      />
                    </>
                  )}
                </Link>
                <Link to={`/user/${post.userId}`}>
                  {post.userName
                    ? post.userName
                    : post.username
                        ?.split(" ")
                        .map(
                          (word) =>
                            word.substring(0, 1).toLowerCase() +
                            word.substring(1)
                        )
                        .join(" ")}
                </Link>
                <span className="flex gap-1">
                  <span>•</span>
                  {timeAgo}
                </span>
              </div>
              <div>
                {user && (
                  <button
                    onClick={() => {
                      if (isFollowing) {
                        unfollowUser(post.userId);
                      } else {
                        followUser(post.userId);
                      }
                    }}
                    className={`${post.userId === USER_ID && "hidden"}  `}
                  >
                    <span className="text-[14px] font-medium text-[#0095f6]">
                      {isFollowing ? "Unfollow" : "Follow"}
                    </span>
                  </button>
                )}
              </div>
            </div>
            {loading && (
              <>
                <div className="h-[250px]">
                  <div className="flex items-center justify-center mt-32">
                    <LoadingSpinner />
                  </div>
                </div>
              </>
            )}
            <Link to={`/posts/${post.id}`}>
              <img
                src={post.imageUrl}
                alt=""
                className="max-h-[600px] w-full object-cover rounded"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{ display: loading ? "none" : "block" }}
              />
            </Link>
            <div className="flex items-center justify-between">
              {likes ? (
                <div className="flex flex-col">
                  <div className="flex items-center w-full gap-3">
                    <button
                      className=""
                      onClick={hasUserLiked ? removeLike : addLike}
                    >
                      {hasUserLiked ? (
                        <>
                          <LikedIcon styling={"w-6 h-6"} color={"#ff3040"} />
                        </>
                      ) : (
                        <>
                          <UnLikedIcon styling={"w-6 h-6"} />
                        </>
                      )}
                    </button>

                    <p
                      className={`font-semibold  text-[14px]  ${
                        likes.length === 0 && "hidden"
                      }`}
                    >
                      {likes.length} likes
                    </p>
                  </div>
                  <div className="flex items-center text-[14px] gap-1 ">
                    {likes.length > 0 && (
                      <h2>
                        {likes.length === 1 ? (
                          <>
                            <span className="p-[3px]">Liked by </span>
                            {likes[0].userId === USER_ID
                              ? "You"
                              : likes[0].userName || likes[0].nameId || ""}
                          </>
                        ) : likes.length === 2 ? (
                          <>
                            <span className="p-[3px]">Liked by </span>
                            {likes[0].userId === USER_ID
                              ? "You"
                              : likes[0].userName || likes[0].nameId || ""}
                            and
                            {likes[1].userId === USER_ID
                              ? "you"
                              : likes[1].userName || likes[1].nameId || ""}
                          </>
                        ) : (
                          <>
                            <span className="p-[3px]">{`Liked by ${likes.length} people including `}</span>
                            {likes.some((like) => like.userId === USER_ID)
                              ? "you"
                              : `${
                                  likes[0].userName || likes[0].nameId || ""
                                } and ${likes.length - 1} others`}
                          </>
                        )}
                      </h2>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className=""
                    onClick={hasUserLiked ? removeLike : addLike}
                  >
                    {hasUserLiked ? (
                      <>
                        <LikedIcon styling={"w-6 h-6"} color={"#ff3040"} />
                      </>
                    ) : (
                      <>
                        <UnLikedIcon styling={"w-6 h-6"} />
                      </>
                    )}
                  </button>
                </>
              )}

              {isSaved ? (
                <button onClick={removeSaved}>
                  <SavedIcon width={20} height={30} />
                </button>
              ) : (
                <button onClick={addSaved}>
                  <UnSavedIcon width={20} height={30} color={"black"} />
                </button>
              )}
            </div>
            <p className="font-semibold flex gap-1  text-[13px] ">
              <span>
                {post.userName
                  ? post.userName
                  : post.username
                      ?.split(" ")
                      .map(
                        (word) =>
                          word.substring(0, 1).toLowerCase() + word.substring(1)
                      )
                      .join(" ")}
              </span>
              <span className="font-normal">{post.description} </span>
            </p>
          </div>
          <div className="flex flex-col items-start justify-start w-full px-2 pb-2 md:px-2">
            <button
              className="text-[12px]"
              disabled={comments?.length === 0}
              onClick={handleToggleClick}
            >
              View all {comments?.length} comments
            </button>

            {comments.slice(0, 2).map((comment) => (
              /* @ts-ignore */
              <div key={comment.id} className="flex justify-between w-full">
                <div className="flex items-center w-full gap-1">
                  <p className=" font-semibold  text-[13px]">
                    {/* @ts-ignore */}
                    {comment.userName ? (
                      <>
                        {/* @ts-ignore */}
                        {comment.userName}
                      </>
                    ) : (
                      <>
                        {/* @ts-ignore */}
                        {comment.displayName}
                      </>
                    )}
                  </p>
                  <p className="font-normal  text-[13px]">
                    {/* @ts-ignore */}
                    {comment?.commentText}
                  </p>
                </div>
                {/* <div>
                  <button>
                    <LikedIcon styling={"w-4 h-4"} />
                  </button>
                </div> */}
              </div>
            ))}
          </div>
          {USER_ID ? (
            <div className="flex items-center justify-center w-full px-2 pt-2 pb-2 md:px-2">
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center justify-center w-full "
              >
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full placeholder:font-normal placeholder:text-[14px] focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className={`font-medium ${
                    newCommentText ? "flex" : "hidden"
                  }`}
                >
                  Post
                </button>
              </form>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};
