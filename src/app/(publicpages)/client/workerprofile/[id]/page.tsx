'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerProfile } from "@/services/workerService";
import ProfileDetails from "@/components/ProfileDetails";
import PreviousWorks from "@/components/PreviousWorks";
import RequestDialog from "@/components/RequestDialog";

export default function ProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);

  
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!id) return;
    getWorkerProfile(id as string).then(setWorker);
  }, [id]);

  if (!worker) {
    return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  }

  return (
    <section className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* ProfileDetails still expects onRequest, so we pass it */}
        <ProfileDetails worker={worker} />

        {/* The button renders the dialog right under itself; we control it here
        <div className="mt-4">
          <RequestDialog /> 
        </div> */}

        {worker.previousWorkImages?.length > 0 && (
          <PreviousWorks
            images={worker.previousWorkImages}
            selected={selectedImg}
            setSelected={setSelectedImg}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
      </div>
    </section>
  );
}
