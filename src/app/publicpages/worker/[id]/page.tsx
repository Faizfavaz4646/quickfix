"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Image from "next/image";
import { FaMessage } from "react-icons/fa6";

interface WorkerProfile {
  name: string;
  workerProfile: {
    profession: string;
    state: string;
    district: string;
    city: string;
    schedule: string;
    profilePic?: string;
    phone: string;
  };
  email: string;
}

export default function WorkerProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:50001/users/${id}`)
        .then((res) => setWorker(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (!worker) {
    return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden pb-10">
      {/* Background Image */}
      <Image
        src="/images/combo.png"
        alt="Worker background"
        fill
        className="object-cover opacity-3"
        priority
      />

      {/* Card */}
      <div className="bg-white rounded-xl shadow-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 p-6 w-full max-w-4xl mt-20 mx-auto">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
          <img
            src={worker.workerProfile.profilePic || "/images/avatar.avif"}
            alt={worker.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{worker.name}</h2>
            <p className="text-black">{worker.workerProfile.profession}</p>
            <div className="mt-2 space-y-1 text-sm text-black">
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FaMapMarkerAlt className="text-black" />{" "}
                {worker.workerProfile.state}, {worker.workerProfile.district},{" "}
                {worker.workerProfile.city}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FaClock className="text-black" /> Available: {worker.workerProfile.schedule}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FaEnvelope className="text-black" /> {worker.email}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FaPhone className="text-black" /> {worker.workerProfile.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium w-full sm:w-auto cursor-pointer">
            Request Service
          </button>
          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 w-full sm:w-auto flex gap-2 cursor-pointer justify-center">
           <FaMessage className="mt-1" /> Message
          </button>
        </div>
      </div>
    </section>
  );
}
