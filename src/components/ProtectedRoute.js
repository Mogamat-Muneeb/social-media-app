import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { LoadingSpinner } from "../components/icon";
const ProtectedRoute = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserData(user);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen">
        <div className="flex items-center justify-center mt-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
