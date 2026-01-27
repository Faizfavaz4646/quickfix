'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

// 1. Dynamic Import (Fixes 'self is not defined' error)
const VideoCall = dynamic(
  () => import('@/components/VideoCall'), 
  { ssr: false } // This disables server-side rendering for this component
);

export default function CallPage() {
  const params = useParams();
  const roomID = params?.roomID as string;
  const { user } = useAuthStore();

  const userName = user?.name || "Guest User";
  const userID = user?._id || "guest-" + Math.floor(Math.random() * 1000);

  if (!roomID) return <div>Invalid Room ID</div>;

  return (
    <main className="w-full h-screen bg-slate-900">
       <VideoCall 
         roomID={roomID} 
         userName={userName}
         userID={userID}
       />
    </main>
  );
}