"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiClient } from "@/lib/api";
import { Post } from "@/app/dto/post";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!id) return;

    apiClient
      .publicGet<Post>(`/posts/${id}`)
      .then(setPost)
      .catch((err) => {
        console.error("Failed to fetch post", err);
      });
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        By {post.author.name} | {new Date(post.created_at).toLocaleString()}
      </p>
      <article className="prose prose-neutral max-w-2xl mx-auto p-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>
    </main>
  );
}
