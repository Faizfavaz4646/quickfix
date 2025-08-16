'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface Worker {
  id: number;
  name: string;
  role: 'client' | 'worker';
  profile?: {
    profilePic?: string;
    profession?: string;
  };
}

const WorkerCard: React.FC = () => {
  const { user } = useAuthStore();
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:50001/users/${user.id}`)
        .then((res) => setWorker(res.data))
        .catch((err) => console.error(err));
    }
  }, [user?.id]);

  if (!worker) return null;

  return (
    <div className="flex items-center gap-3 bg-white shadow-md rounded-xl p-4">
      <img
        src={worker.profile?.profilePic || '/images/avatar.avif'}
        alt="Profile"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h2 className="font-semibold">{worker.name}</h2>
        <p className="text-gray-500 text-sm">{worker.profile?.profession || 'No Profession Added'}</p>
      </div>
    </div>
  );
};

export default WorkerCard;
