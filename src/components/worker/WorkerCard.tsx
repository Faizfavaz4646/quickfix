'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface Worker {
  id: string;
  userId: string;
  profession?: string;
  profilePic?: string;
  phone?: string;
  gender?: string;
  state?: string;
  district?: string;
  city?: string;
  zip?: string;
  schedule?: string;
  termsAccepted?: boolean;
}

interface User {
  id: string;
  name: string;
  role: 'client' | 'worker';
}

const WorkerCard: React.FC = () => {
  const { user } = useAuthStore();
  const [workerProfile, setWorkerProfile] = useState<Worker | null>(null);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!user?.id) return;

      try {
        const { data } = await axios.get(`http://localhost:50001/workers?userId=${user.id}`);
        if (data.length > 0) {
          setWorkerProfile(data[0]); // get first worker for this user
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkerProfile();
  }, [user?.id]);

  if (!user || !workerProfile) return null;

  return (
    <div className="flex items-center gap-3 bg-white shadow-md rounded-xl p-3 hover:bg-gray-50 transition">
      <img
        src={workerProfile.profilePic || '/images/avatar.avif'}
        alt="Profile"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/avatar.avif';
        }}
      />
      <div>
        <h2 className="font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-500 text-sm">
          {workerProfile.profession || 'No Profession Added'}
        </p>
      </div>
    </div>
  );
};

export default WorkerCard;
