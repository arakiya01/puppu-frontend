"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function Publish() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      setError("タイトルと本文は必須です");
      return;
    }

    await apiClient
      .post("/posts", { title, content })
      .catch((err) => setError(err.message || "投稿に失敗しました"));
    router.push("/home");
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">記事を投稿する</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block font-medium mb-1">タイトル</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事のタイトル"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">本文（Markdown）</label>
        {!showPreview ? (
          <textarea
            className="w-full p-2 border rounded h-[300px] resize-vertical"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="本文をMarkdownで入力"
          />
        ) : (
          <div className="border rounded p-4 bg-gray-50 min-h-[300px] prose">
            <ReactMarkdown>{content || "_ここにMarkdownが表示されます_"}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setShowPreview(!showPreview)} className="text-blue-600 underline">
          {showPreview ? "編集に戻る" : "プレビューを見る"}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          投稿する
        </button>
      </div>
    </main>
  );
}
