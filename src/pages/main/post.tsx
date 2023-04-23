import {
  addDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../../config/firebase";
import { Post as IPost } from "./main";

interface Props {
  post: IPost;
}

interface Like {
  likeId: string;
  userId: string;
  nameId: string | null;
  emailId: string | null;
}

export const Post = (props: Props) => {
  const { post } = props;
  const [user] = useAuthState(auth);
  console.log(user?.email, "user");

  const [likes, setLikes] = useState<Like[] | null>(null);

  const likesRef = collection(db, "likes");

  const likesDoc = useMemo(
    () => query(likesRef, where("postId", "==", post.id)),
    [post.id]
  );

  const getLikes = async () => {
    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({
        userId: doc.data().userId,
        likeId: doc.id,
        nameId: doc.data().nameId,
        emailId: doc.data().emailId,
      }))
    );
  };
  const addLike = async () => {
    try {
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
        nameId: user?.displayName ?? null,
        emailId: user?.email ?? null,
      });
      if (user) {
        setLikes((prev) =>
          prev
            ? [
                ...prev,
                {
                  userId: user.uid,
                  likeId: newDoc.id,
                  nameId: user.displayName ?? null,
                  emailId: user.email ?? null,
                },
              ]
            : [
                {
                  userId: user.uid,
                  likeId: newDoc.id,
                  nameId: user.displayName ?? null,
                  emailId: user.email ?? null,
                },
              ]
        );
      }
    } catch (err) {
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

  return (
    <div className="flex flex-col items-center justify-center mt-20 ">
      <div className="max-w-[500px] w-full flex flex-col  shadow-lg rounded   h-full">
        <div className="flex flex-col w-full gap-2 p-2 text-start">
          <div className="flex items-center gap-2">
            <img
              src={post.userPp}
              className="border rounded-full shadow w-9 h-9"
              alt=""
            />
            <span>
              @
              {post.username
                ?.split(" ")
                .map(
                  (word) =>
                    word.substring(0, 1).toLowerCase() + word.substring(1)
                )
                .join(" ")}
            </span>
          </div>

          <img src={post.imageUrl} alt="" />

          <div className="flex items-center">
            {likes ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <button
                    className=""
                    onClick={hasUserLiked ? removeLike : addLike}
                  >
                    {hasUserLiked ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="red"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="red"
                          className="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="black"
                          className="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
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
                <div className="flex items-center text-[14px]">
                  {likes.length > 0 &&
                    likes.map((like, index) => (
                      <h2 key={like.likeId}>
                        Liked by
                        <span className="pr-1">{index === 0 ? "" : ", "}</span>
                        {like.userId === user?.uid
                          ? "You"
                          : like.nameId && like.emailId}
                      </h2>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="red"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="red"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="black"
                        className="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          <p className="font-semibold  text-[13px] ">
            {post.username}{" "}
            <span className="font-normal">{post.description} </span>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};
