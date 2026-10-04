import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { profilePathExists } from "@/lib/profiles";

// Public profile pages: /<steamid64> or /<custom-url-name>.
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "Player profile",
    robots: { index: false, follow: true },
    alternates: { canonical: `/${id}` },
  };
}

export default async function ProfilePage({ params }) {
  const { id } = await params;
  if (!(await profilePathExists(id))) notFound();
  return <ProfileClient id={id} />;
}
