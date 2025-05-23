"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/api";

export default function InitApiRedirect() {
  const router = useRouter();

  useEffect(() => {
    setRedirect(() => {
      router.push("/home");
    });
  }, [router]);

  return null;
}
