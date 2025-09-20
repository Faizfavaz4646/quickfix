import Hero from "@/components/ui/Hero";
import TopRatedProfessionals from "@/components/ui/TopRatedProfessionals";
import WorkerCategories from "@/components/ui/WorkerCategories";

import JobPostWrapper from "./jobs-posts/JobPostWrapper";


export default function Home() {

  return (
    <>
      <Hero />

      <JobPostWrapper />
      <WorkerCategories />
      <TopRatedProfessionals />
    </>
  );
}
