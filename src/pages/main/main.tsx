import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { Post } from "./post";
import { LoadingSpinner } from "../../components/icon";

export interface Post {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
  imageUrl: string;
  userPp: string;
  date: string;
  likesCount: any;
  userName: any;
  imageURL: any;
  photoURL: any;
  likedBy: any;
  storageRef: any;
}

export const Main = () => {
  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const postsRef = collection(db, "posts");
  const postsRefQuery = query(postsRef, orderBy("date", "desc"));
  useEffect(() => {
    const unsubscribe = onSnapshot(postsRefQuery, (querySnapshot) => {
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPostsList(posts);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <div
      className={` mb-[100px] ${
        isLoading
          ? "h-screen"
          : "h-full" && postsList?.length === 0
          ? "h-screen"
          : "h-full"
      }`}
    >
      <div>
        {postsList?.length === 0 && (
          <div className="flex justify-center pt-10 item-center">No posts right now</div>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center mt-32">
          <LoadingSpinner />
        </div>
      ) : (
        postsList?.map((post) => (
          <div key={post.id}>
            <Post key={post.id} post={post} />
          </div>
        ))
      )}
    </div>
  );
};
