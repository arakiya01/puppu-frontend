"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/api";

export default function SignUpModalButton() {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSignup = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("登録失敗: " + error.message);
      return;
    }
    await apiClient.post("/users", JSON.stringify({ name: username }));
    setIsLoading(false);
    setShowModal(false);
    location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <>
      {showModal ? (
        <div className="inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <input
              className="w-full mb-3 p-2 text-sm border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              type="username"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full mb-3 p-2 text-sm border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full mb-4 p-2 text-sm border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />

            <button
              onClick={handleSignup}
              disabled={isLoading}
              className={`w-full px-3 py-2 text-sm text-white rounded ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "読み込み中..." : "登録"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {" "}
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              登録中...
            </>
          ) : (
            "新規登録"
          )}
        </button>
      )}
    </>
  );
}
