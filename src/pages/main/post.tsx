import {
  addDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../../config/firebase";
import { Post as IPost } from "./main";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { config } from "../../config/index";
import {
  UnLikedIcon,
  LikedIcon,
  SavedIcon,
  UnSavedIcon,
} from "../../components/icon";
interface Props {
  post: IPost;
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
  const navigate = useNavigate();
  const [likes, setLikes] = useState<Like[] | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const likesRef = collection(db, "likes");

  const likesDoc = useMemo(
    () => query(likesRef, where("postId", "==", post?.id)),
    [post.id]
  );
  const savedRef = useMemo(
    () =>
      query(
        collection(db, "saved"),
        where("postId", "==", post?.id),
        where("userId", "==", user?.uid ?? "")
      ),
    [post?.id, user?.uid]
  );
  const addSaved = async () => {
    try {
      const newDoc = await addDoc(collection(db, "saved"), {
        userId: user?.uid,
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
  const USER_ID = user?.uid;
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

  const addLike = () => {
    try {
      const newDoc = addDoc(likesRef, {
        userId: user?.uid,
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
      }
    } catch (err) {
      toast("Please login to like", {
        ...config,
        type: "error",
      });
      console.log(err);
    }
  };

  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
      await deleteDoc(likeToDelete);
      if (user) {
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);

  useEffect(() => {
    getLikes();
  }, []);

  const currentDate = new Date();
  const postDate = new Date(post.date);
  /* @ts-ignore */
  const diffInMinutes = Math.floor((currentDate - postDate) / (1000 * 60));

  let timeAgo;

  if (diffInMinutes >= 1440) {
    const diffInDays = Math.floor(diffInMinutes / 1440);
    timeAgo = `${diffInDays}d`;
  } else if (diffInMinutes >= 60) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    timeAgo = `${diffInHours}h`;
  } else {
    timeAgo = `${diffInMinutes}m`;
  }

  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center px-2 mt-20 md:px-0">
      <div className="max-w-[500px] w-full flex flex-col border-[1px] rounded   h-full">
        <div className="flex flex-col w-full gap-2 p-2 text-start">
          <div className="flex items-center gap-2">
            <Link to={`${post.userId}`}>
              {post.photoURL ? (
                <>
                  <img
                    // src={post.photoURL}
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
            <Link to={`${post.userId}`}>
              {post.userName
                ? post.userName
                : post.username
                    ?.split(" ")
                    .map(
                      (word) =>
                        word.substring(0, 1).toLowerCase() + word.substring(1)
                    )
                    .join(" ")}
            </Link>
            <span className="flex gap-1">
              <span>•</span>
              {timeAgo}
            </span>
          </div>
          {loading && (
            <>
              <div className="h-[250px]">
                <div className="flex items-center justify-center mt-32">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600"
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
                      fill="       #ff3040"
                    />
                  </svg>
                </div>
              </div>
            </>
          )}

          <img
            src={post.imageUrl}
            alt=""
            className="max-h-[600px] object-cover"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
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
                        <LikedIcon />
                      </>
                    ) : (
                      <>
                        <UnLikedIcon />
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
                  {likes.length > 0 &&
                    likes.map((like, index) => (
                      <>
                        <h2 key={like.likeId}>
                          <span className="p-[3px]">
                            {index === 0 ? "Liked by" : ""}
                          </span>
                          <span className="">{index === 0 ? "" : ", "}</span>

                          {like.userId === user?.uid
                            ? "You"
                            : like.userName || like.nameId
                            ? like.userName || like.nameId
                            : ""}
                        </h2>
                      </>
                    ))}
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
                      <LikedIcon />
                    </>
                  ) : (
                    <>
                      <UnLikedIcon />
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
                <UnSavedIcon width={20} height={30} />
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
      </div>
    </div>
  );
};
