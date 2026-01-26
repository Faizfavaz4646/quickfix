import Hero from "@/components/ui/Hero";
// import TopRatedProfessionals from "@/components/ui/TopRatedProfessionals";
// import WorkerCategories from "@/components/ui/WorkerCategories";
import PostFeedPage from "./jobs-posts/postFeedPage";
// import ClientPostsPage from "./jobs-posts/ClientPostsPage";



export default function Home() {

  return (
    <>
      <Hero />
  
      {/* <WorkerCategories /> */}
      {/* <TopRatedProfessionals /> */}
      <PostFeedPage />

    </>
  );
}
