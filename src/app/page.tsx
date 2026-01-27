export const dynamic = "force-dynamic";
import Hero from "@/components/ui/Hero";
import PostFeedPage from "./jobs-posts/postFeedPage";
import HomeRedirect from "@/components/auth/HomeRedirect";




export default function Home() {

  return (
    <>
    <HomeRedirect />
    
      <Hero />
  
   
      <PostFeedPage />

    </>
  );
}
