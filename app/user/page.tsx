"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import LoginModalButton from "@/components/loginModalButton";

export default function UserName() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("ログイン失敗: " + error.message);
      return;
    }
    await refreshUser();
    setShowLoginForm(false);
    setEmail("");
    setPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await refreshUser();
    router.push("/home");
  };

  // Enterキーでログイン
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // click outside で閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowLoginForm(false);
      }
    };
    if (showLoginForm) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginForm]);

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <LoginModalButton />
      )}
    </div>
  );
}
