"use client";

import { useState } from "react";
import Posts from "../posts/page";
import Publish from "../publish/page";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "list" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
          }`}
        >
          記事一覧
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "create" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
          }`}
        >
          記事投稿
        </button>
      </div>

      {activeTab === "list" && (
        <ul className="space-y-4">
          <Posts />
        </ul>
      )}

      {activeTab === "create" && (
        <div>
          <Publish />
        </div>
      )}
    </main>
  );
}
