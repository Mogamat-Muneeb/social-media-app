import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Chat = ({
  allUsers,
  currentUser,
  allMessages,
  handleStartChat,
  selectedUser,
}: {
  allUsers: any;
  currentUser: any;
  allMessages: any;
  handleStartChat: any;
  selectedUser: any;
}) => {
  const { uuid } = useParams();

  return (
    <div className="w-full ">
      <div className="flex items-start justify-start px-3 py-2 ">
        <h2 className="font-bold text-black ">{currentUser?.username}</h2>
      </div>

      <ul className=" w-full  h-[700px]  overflow-y-auto ">
        {allUsers.map((user: any) => {
          return (
            <li key={user.id}>
              <Link
                to={`/messages/${user.id}/?currentUser=${currentUser?.uid}`}
                onClick={() => handleStartChat(user)}
                className={` ${user.id === currentUser?.uid ? " hidden" : ""} `}
              >
                <div
                  className={` flex  gap-3  items-center   py-[10px]   px-3 ${
                    selectedUser && selectedUser?.id === user.id
                      ? " font-bold  text-white  bg-gray-300"
                      : ""
                  }`}
                >
                  <img
                    src={user.photoURL || ""}
                    alt=""
                    className="w-10 h-10 rounded-full "
                  />
                  <span className={``}>{user.displayName}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Chat;
