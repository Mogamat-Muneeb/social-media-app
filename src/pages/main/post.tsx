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
      <div className="max-w-[500px] w-full flex flex-col items-center justify-center shadow-md rounded py-10 h-full">
        <div className="title">
          <img src={post.imageUrl} alt="" />
        </div>
        <div className="body">
          <p> {post.description} </p>
        </div>

        <div className="footer">
          <p> @{post.username} </p>
          <button onClick={hasUserLiked ? removeLike : addLike}>
            {hasUserLiked ? <>&#128078;</> : <>&#128077;</>}{" "}
          </button>

          {likes && (
            <div className="flex flex-col items-center ">
              <p className="font-semibold"> {likes.length} likes</p>
              <div className="flex items-center text-[14px]">
                {likes.length > 0 &&
                  likes.map((like, index) => (
                    <h2 key={like.likeId}>
                      <span className="pr-1">{index === 0 ? "" : ", "}</span>
                      {like.userId === user?.uid
                        ? "You"
                        : like.nameId && like.emailId}
                    </h2>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
