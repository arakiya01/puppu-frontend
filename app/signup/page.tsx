"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Post } from "../dto/post";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Signup failed:", error.message);
      return;
    }

    await apiClient.post("/users", JSON.stringify({ name: name }));

    router.push("/home");
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">サインアップ</h1>
      <input
        className="w-full border p-2 rounded"
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="パスワード（6文字以上）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        type="text"
        placeholder="ユーザー名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="w-full bg-green-600 text-white p-2 rounded"
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "登録中..." : "サインアップ"}
      </button>
    </div>
  );
}
