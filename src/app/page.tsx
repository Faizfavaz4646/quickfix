import Hero from "@/components/ui/Hero";
import TopRatedProfessionals from "@/components/ui/TopRatedProfessionals";
import WorkerCategories from "@/components/ui/WorkerCategories";
import CreatePostModal from "@/components/CreatePostModal";
// import ClientPostsPage from "./jobs-posts/ClientPostsPage";



export default function Home() {

  return (
    <>
      <Hero />
      <CreatePostModal />
      <WorkerCategories />
      <TopRatedProfessionals />
    </>
  );
}
