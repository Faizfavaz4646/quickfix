import { redirect } from "next/navigation";
import Hero from "@/components/ui/Hero";
import PostFeedPage from "./jobs-posts/postFeedPage";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies(); // ✅ await
  const role = cookieStore.get("role")?.value;

  if (role === "worker") redirect("/worker/dashboard");
  if (role === "admin") redirect("/admin/dashboard");

  return (
    <>
      <Hero />
      <PostFeedPage />
    </>
  );
}
