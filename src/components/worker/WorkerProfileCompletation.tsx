"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { Profile } from "@/types/user";

export default function ProfileCompletion() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get<Profile[]>(
          `http://localhost:3000/workers?userId=${user?.id}`
        );
        if (data.length) {
          const worker = data[0];
          setProfile(worker);

          let filledFields = 0;
          const totalFields = 9;
          if (worker.profession) filledFields++;
          if (worker.phone) filledFields++;
          if (worker.gender) filledFields++;
          if (worker.state) filledFields++;
          if (worker.district) filledFields++;
          if (worker.city) filledFields++;
          if (worker.zip) filledFields++;
          if (worker.schedule) filledFields++;
          if (worker.profilePic) filledFields++;

          const percent = Math.round((filledFields / totalFields) * 100);
          setCompletion(percent);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (user?.id) fetchProfile();
  }, [user]);

  // Circle calculations
  const radius = 70; // bigger circle
  const stroke = 10; // thicker stroke
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs p-6 rounded-lg  mt-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Completion</h2>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb" // gray-200
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#3b82f6" // blue-500
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-xl font-semibold text-gray-800"
        >
          {completion}%
        </text>
      </svg>
      <p className="mt-4 text-sm text-gray-500 text-center">
        {completion === 100
          ? "🎉 Congratulations! Your profile is complete."
          : "Add more details to increase visibility."}
      </p>
    </div>
  );
}
