"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Post } from "../dto/post";
import Link from "next/link";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetched = await apiClient.publicGet<Post[]>("/posts");
        setPosts(fetched);
      } catch (err) {
        console.error(err);
        setError("投稿の取得に失敗しました");
      }
    };

    loadPosts();
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">記事一覧</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="border-b pb-2">
            <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
              <h2 className="text-lg font-semibold">{post.title}</h2>
            </Link>
            <p className="text-sm text-gray-500">
              {post.author.name} | {new Date(post.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
