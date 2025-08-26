'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Profile } from '@/types/user';
import { getWorkerProfile } from '@/services/workerService';

const WorkerCard = () => {
  const { user } = useAuthStore();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    getWorkerProfile(user.id.toString())
      .then((data) => {
        if (data) setWorkerProfile(data);
      })
      .catch((err) => {
        console.error('Failed to fetch worker profile:', err);
      });
  }, [user?.id]);

  if (!user || !workerProfile) return null; 

  return (
    <div className="flex items-center gap-3 bg-white shadow-md rounded-xl p-3 hover:bg-gray-50 transition">
      <img
        src={workerProfile.profilePic || '/images/avatar.avif'}
        alt="Profile"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200"
        onError={(e) => {
          e.currentTarget.src = '/images/avatar.avif';
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
