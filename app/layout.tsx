// app/layout.tsx
"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { User } from "./dto/user";
import { apiClient } from "@/lib/api";
import UserName from "./user/page";
import InitApiRedirect from "@/components/InitApiRedirect";
import { UserProvider } from "@/context/userContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      await apiClient
        .get<User>("/users/me")
        .then(setUser)
        .catch(() => setUser(null));
    };
    loadUser();
  }, []);

  return (
    <html lang="ja">
      <UserProvider>
        <body>
          <InitApiRedirect />
          <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold items-center">ぷっぷぷぷぷ</h1>
            <UserName />
          </header>
          <main className="pt-6 px-4 max-w-4xl mx-auto">{children}</main>
        </body>
      </UserProvider>
    </html>
  );
}
