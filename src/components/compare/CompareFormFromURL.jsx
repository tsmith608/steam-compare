"use client";
import { useSearchParams } from "next/navigation";
import CompareForm from "@/components/compare/CompareForm";

/** Reads ?p=a,b,c (edit group) and ?pick=1 (open friend picker) client-side so the homepage stays static. */
export default function CompareFormFromURL() {
  const sp = useSearchParams();
  const initial = (sp.get("p") || "").split(",").filter(Boolean).slice(0, 16);
  return <CompareForm key={initial.join(",")} initial={initial} autoPick={sp.get("pick") === "1"} />;
}
