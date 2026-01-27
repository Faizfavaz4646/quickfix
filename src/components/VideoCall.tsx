'use client';

import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRouter } from 'next/navigation';

const APP_ID = Number(process.env.NEXT_PUBLIC_APP_ID);
const SERVER_SECRET = process.env.NEXT_PUBLIC_SERVER_SECRET || "";
interface VideoCallProps {
  roomID: string;
  userName?: string;
  userID?: string;
}

const VideoCall = ({ roomID, userName, userID }: VideoCallProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Ref to store the active Zego instance
  const zpInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initCall = async () => {
      if (!containerRef.current) return;

      // 2. Safe User Data
      const safeUserID = (userID && userID.trim() !== "") 
        ? userID 
        : `guest-${Math.floor(Math.random() * 10000)}`;

      const safeUserName = (userName && userName.trim() !== "") 
        ? userName 
        : `User ${safeUserID}`;

      console.log("🚀 Init Zego Call...", { roomID, safeUserID });

      // 3. Generate Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomID,
        safeUserID,
        safeUserName
      );

      // 4. Create Instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp; // Save to ref

      // 5. Join Room
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, 
        },
        sharedLinks: [
          {
            name: 'Copy Link',
            url: window.location.origin + '/call/' + roomID,
          },
        ],
        showPreJoinView: false, 
        onLeaveRoom: () => {
          router.back(); 
        },
      });
    };

    // Run initialization
    initCall();

    // 🛑 6. CLEANUP FUNCTION (Crucial for React 18)
    // When this effect re-runs or component unmounts, destroy the old instance.
    return () => {
      if (zpInstanceRef.current) {
        console.log("🧹 Cleaning up old Zego instance...");
        zpInstanceRef.current.destroy();
        zpInstanceRef.current = null;
      }
    };
  }, [roomID, userName, userID, router]);

  return (
    <div 
      className="w-full h-screen bg-slate-900 flex items-center justify-center"
      ref={containerRef}
    >
      {/* Video UI mounts here */}
    </div>
  );
};

export default VideoCall;