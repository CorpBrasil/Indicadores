import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export default function AuthContextProvider(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, displayName, email } = user;
        setUser({
          id: uid,
          name: displayName,
          email: email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return getUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && props.children}
    </AuthContext.Provider>
  );
}
