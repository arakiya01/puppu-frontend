"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/app/dto/user";
import { apiClient } from "@/lib/api";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      const user = await apiClient.get<User>("/users/me");
      setUser(user);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
