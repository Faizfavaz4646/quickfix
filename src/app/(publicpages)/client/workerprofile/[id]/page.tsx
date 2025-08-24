'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerProfile } from "@/services/workerService";
import ProfileDetails from "@/components/ProfileDetails";
import RequestDialog from "@/components/RequestDialog";
import PreviousWorks from "@/components/PreviousWorks";

export default function ProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!id) return;
    getWorkerProfile(id as string).then(setWorker);
  }, [id]);

  if (!worker) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;

  return (
    <section className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <ProfileDetails worker={worker} onRequest={() => setShowDialog(true)} />
        {showDialog && <RequestDialog onClose={() => setShowDialog(false)} />}
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
