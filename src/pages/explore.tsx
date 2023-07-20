import React, { useEffect, useState } from "react";
import { collection, onSnapshot, Unsubscribe } from "firebase/firestore";
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
  const [users, setUsers] = useState<UserData[]>([]);
  const [userFollowers, setUserFollowers] = useState<{
    [userId: string]: string[];
  }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        //@ts-ignore
        const updatedUsers: UserData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(updatedUsers);
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | undefined;

    const getUsers = async () => {
      unsubscribe = await fetchUsers();
    };

    getUsers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfileFollowers = async (userId: string) => {
      const profileFollowingRef = collection(db, "following");
      const unsubscribe = onSnapshot(profileFollowingRef, (querySnapshot) => {
        const followersList: string[] = [];

        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            const followingData = doc.data();
            if (
              followingData &&
              Array.isArray(followingData.following) &&
              followingData.following.includes(userId)
            ) {
              followersList.push(doc.id);
            }
          }
        });

        setUserFollowers((prevFollowers) => ({
          ...prevFollowers,
          [userId]: followersList,
        }));
      });

      return () => {
        unsubscribe();
      };
    };

    users?.forEach((user: UserData) => {
      fetchProfileFollowers(user.uid);
    });
  }, [users]);

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-0">
      <h2 className="font-bold md:text-[32px] text-[20px] pt-10">Explore</h2>
      <div>
        {users?.map((user: UserData) => (
          <div key={user.uid}>
            <div className="flex gap-4 py-4">
              <div>
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-col ">
                  <div className="flex justify-between">
                    <Link to={`/user/${user.uid} `}>
                      <p>{user.displayName}</p>
                    </Link>
                    {/* <div className="px-3 py-1 border rounded">follow</div> */}
                  </div>

                  <p>{user.userName}</p>
                  <h3 className="text-[14px] flex gap-1">
                    <span>{userFollowers[user.uid]?.length || 0}</span>
                    <span>
                      {userFollowers[user.uid]?.length === 1
                        ? "follower"
                        : "followers"}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
