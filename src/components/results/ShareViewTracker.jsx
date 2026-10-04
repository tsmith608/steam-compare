"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

export default function ShareViewTracker({ name = "share_viewed" }) {
  useEffect(() => {
    track(name);
  }, [name]);
  return null;
}
