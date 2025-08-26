"use client";

import { useAuthStore, Request, Profile } from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  getWorkerProfile,
  acceptRequest,
  declineRequest,
} from "@/services/workerService";
import { CheckCircle, XCircle } from "lucide-react";

export default function NewRequests() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch worker profile on mount
  useEffect(() => {
    if (user?.id) {
      getWorkerProfile(user.id.toString()).then(setProfile);
    }
  }, [user]);

  // Accept request
  const handleAccept = async (requestId: number) => {
    if (!user?.id) return;
    setLoading(true);
    const updatedProfile = await acceptRequest(user.id.toString(), requestId);
    setProfile(updatedProfile);
    setLoading(false);
  };

  // Decline request
  const handleDecline = async (requestId: number) => {
    if (!user?.id) return;
    setLoading(true);
    const updatedProfile = await declineRequest(user.id.toString(), requestId);
    setProfile(updatedProfile);
    setLoading(false);
  };

  return (
    <div className="border border-gray-200 w-full h-64 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col">
      <h3 className="font-semibold text-lg text-gray-800 mb-3">New Requests</h3>

      {/* Scrollable requests */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {profile?.requests && profile.requests.length > 0 ? (
          profile.requests.map((req: Request) => (
            <div
              key={req.id}
              className="border border-gray-200 p-3 rounded-md flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* Left side */}
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {req.description || "No description"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {req.date
                    ? new Date(req.date).toLocaleString()
                    : "No date provided"}
                </p>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition"
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center mt-6">
            No new requests right now.
          </p>
        )}
      </div>
    </div>
  );
}
