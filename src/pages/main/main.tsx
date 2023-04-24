import { getDocs, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { Post } from "./post";

export interface Post {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
  imageUrl: string;
  userPp: string;
  date: string
}

export const Main = () => {
  const [postsList, setPostsList] = useState<Post[] | null>(null);
  const postsRef = collection(db, "posts");
  const postsRefQuery = query(postsRef, orderBy("date", "desc"));
  useEffect(() => {
    const unsubscribe = onSnapshot(postsRefQuery, (querySnapshot) => {
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPostsList(posts);
    });
    
    return unsubscribe;
  }, []);
  return (
    <div>
      {postsList?.map((post) => (
        <div key={post.id}>
          <Post post={post} />
        </div>
      ))}
    </div>
  );
};
