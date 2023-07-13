import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  Unsubscribe,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";

interface UserData {
  displayName: string;
  email: string;
  otherData: string;
  photoURL: any;
  userName: any;
  bio: any;
  uid: any;
}

const Explore = () => {
  const [users, setusers] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchusers = async () => {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const updatedusers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //@ts-ignore
        setusers(updatedusers);
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | undefined;

    const getusers = async () => {
      unsubscribe = await fetchusers();
    };

    getusers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-0">
      <h2>Explore</h2>
      <div>
        {/* @ts-ignore */}
        {users?.map((user: any) => {
          return (
            <div>
              <div className="flex py-4 gap-3">
                <div>
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    <Link to={`/user/${user.uid} `}>
                      <p>{user.displayName}</p>
                    </Link>
                    <p>{user.userName}</p>
                    <p>{user.bio}</p>
                  </div>
                </div>
              </div>
                <div className="border-b border-[1px] border-gray-300"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Explore;
