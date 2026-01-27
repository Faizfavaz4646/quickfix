"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyWorkerProfile } from "@/services/workerService"; // ✅ Use the Service
import { Profile } from "@/types/user";
import Link from "next/link";


export default function ProfileCompletion() {
  const { user, token } = useAuthStore();
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateCompletion = async () => {
      // Safety check: Needs user and token
      if (!user || !token || user.role !== "worker") return;

      try {
        // 1. Fetch Fresh Profile Data from Backend
        const workerProfile = await getMyWorkerProfile(token);

        if (workerProfile) {
          // 2. Define the fields you want to track for "100%"
          // Adjust this list based on what is mandatory for your app
          const fields = [
            workerProfile.profession,
            workerProfile.phone,
            workerProfile.gender,
            workerProfile.state,
            workerProfile.district,
            workerProfile.city,
            workerProfile.zip,
            workerProfile.profilePic,
            workerProfile.hourlyRate, // Added (Common for workers)
            workerProfile.about,      // Added (Bio is important)
            workerProfile.schedule    // Added
          ];

          // 3. Count how many are filled
          let filledCount = 0;
          fields.forEach((val) => {
            // Check for non-empty strings, numbers, or non-empty arrays
            if (val && typeof val === "string" && val.trim() !== "") filledCount++;
            else if (typeof val === "number") filledCount++; 
            else if (Array.isArray(val) && val.length > 0) filledCount++;
          });

          const totalFields = fields.length;
          const percent = Math.round((filledCount / totalFields) * 100);
          
          setCompletion(percent);
        }
      } catch (error) {
        console.error("Failed to fetch profile completion:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateCompletion();
  }, [user, token]);

  // --- Circle Calculations (Unchanged) ---
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  if (loading) return null; // Or a small skeleton loader

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs p-6 rounded-2xl mt-6 bg-white border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Health</h2>
      
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            stroke="#f1f5f9" // slate-100
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <circle
            stroke={completion === 100 ? "#22c55e" : "#3b82f6"} // Green if 100%, else Blue
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage Text in Center */}
        <div className="absolute flex flex-col items-center">
            <span className={`text-3xl font-black ${completion === 100 ? 'text-green-500' : 'text-slate-800'}`}>
                {completion}%
            </span>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-slate-500 text-center px-2">
        {completion === 100
          ? "🎉 Great job! Your profile is visible to everyone."
          : "Complete your profile to rank higher in search results."}
      </p>
      
      {completion < 100 && (
         <Link href="/worker/edit" className="mt-4">
             <button className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                Complete Now
             </button>
         </Link>
      )}
    </div>
  );
}