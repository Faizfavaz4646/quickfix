'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";

interface WorkerProfile {
  id: string;
  userId: string;
  profilePic?: string;
  profession?: string;
  state?: string;
  district?: string;
  city?: string;
  schedule?: string;
  phone?: string;
  name?: string;
  email?: string;
  previousWorkImages?: string[];
}

export default function ProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showAllWorks, setShowAllWorks] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchWorker = async () => {
      try {
        const { data } = await axios.get(`http://localhost:50001/workers?userId=${id}`);
        if (data.length > 0) {
          const { data: userData } = await axios.get(`http://localhost:50001/users/${id}`);
          setWorker({ ...data[0], name: userData.name, email: userData.email });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorker();
  }, [id]);

  if (!worker) {
    return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  }

  const workImages = worker.previousWorkImages || [];
  const displayedImages = showAllWorks ? workImages : workImages.slice(0, 4);

  return (
    <section className="relative w-full min-h-screen bg-gray-50 pb-16">
      <div className="max-w-5xl mx-auto px-6">

       {/* Top Profile Card - Updated Style */}
<div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center gap-6 relative">

  {/* Left - Profile Pic & Status */}
  <div className="flex flex-col items-center md:items-start text-center md:text-left">
    <div className="relative">
      <img
        src={worker.profilePic || "/images/avatar.avif"}
        alt={worker.name}
        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
      />
      {/* Online status dot */}
      <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white bg-green-500"></span>
    </div>
    <h2 className="text-2xl font-semibold text-gray-800 mt-3">{worker.name}</h2>
    <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm mt-2 font-medium">
      {worker.profession || 'No Profession Added'}
    </span>
    
    {/* Rating */}
    <div className="flex items-center mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z"/>
        </svg>
      ))}
      <span className="text-gray-600 text-sm ml-2">4.8 (127 reviews)</span>
    </div>

    {/* Location */}
    <p className="flex items-center gap-2 text-gray-500 mt-1">
      <FaMapMarkerAlt className="text-blue-500" /> {worker.state}, {worker.district}, {worker.city}
    </p>
  </div>

  {/* Right - Actions */}
  <div className="flex  gap-3 w-full md:w-auto mt-4 md:mt-0">
    <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md font-medium hover:bg-blue-50 flex items-center gap-2 justify-center">
      <FaMessage /> Chat Now
    </button>
    <button 
      onClick={() => setShowDialog(!showDialog)}
      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium"
    >
      Request Service
    </button>
  </div>

</div>


        {/* Previous Works */}
        {workImages.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Works</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {displayedImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Work ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
            {workImages.length > 4 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowAllWorks(!showAllWorks)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {showAllWorks ? "Show Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
