import { Link, useParams } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Post as IPost } from "../pages/main/main";
import { LikedIcon, LoadingSpinner } from "../components/icon";

export const SinglePost = () => {
  interface LikesCount {
    [postId: string]: number;
  }

  const { postId } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likesCount, setLikesCount] = useState<LikesCount>({});

  useEffect(() => {
    /* @ts-ignore */
    const docRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        /* @ts-ignore */
        setPost(docSnapshot.data() as IPost[]);
        setIsLoading(false);
      }
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
  }, [postId]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen mt-32">
            <LoadingSpinner />
        </div>
      ) : (
        <div className="flex items-center h-screen overflow-hidden">
          <div className=" w-full  grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1  md:max-w-[1000px] max-w-[500px] justify-center  mx-auto   max-h-[1000px] gap-4">
            <div className="flex items-center justify-center w-full ">
              <img
                src={post?.imageUrl}
                alt=""
                className="object-cover h-[700px]"
              />
            </div>
            <div className="flex flex-col items-start justify-between w-full h-ful">
              <div className="flex items-center gap-2 ">
                <img
                  src={post?.photoURL}
                  alt=""
                  className="object-cover w-8 h-8 rounded-full shadow-lg md:w-11 md:h-11 "
                />
                <p>{post?.username}</p>
              </div>
              <div className="flex flex-col">
                <span>no commentsz</span>
                <span>no commentsz</span>
                <span>no commentsz</span>
                <span>no commentsz</span>
                <span>no commentsz</span>
                <span>no commentsz</span>
              </div>
              <div className="">
                <p>{post?.description}</p>

                {/* @ts-ignore */}
                {likesCount[postId] && (
                  <div className="flex items-center text-gray-500">
                    <LikedIcon   styling={"w-6 h-6"}/>
                    {/* @ts-ignore */}
                    <span className="px-1"> {likesCount[postId]}</span>
                    {/* @ts-ignore */}
                    <span> {likesCount[postId] === 1 ? "like" : "likes"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
