'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import WorkerModel from '@/components/animation/WorkerModel';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import axios from 'axios';
import { API_URL } from '@/lib/constants';

// ✅ Axios Instance with Auth Interceptor
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem("quickfix-user");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const token = parsed.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Auth token parse error");
    }
  }
  return config;
});

interface Profile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
    profilePic?: string;
  };
}

export default function Hero() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Unified Role Logic
  const handleJoinProfessional = () => {
    if (!user) {
      router.push("/auth/signup?role=worker");
      return;
    }

    const currentRole = profile?.role || user?.role;

    if (currentRole === "client") {
      toast.error("You are registered as a client. Please logout to register as a worker.");
      return;
    }

    if (currentRole === "worker") {
      toast.success("Welcome back! Redirecting to your dashboard...");
      router.push("/worker/dashboard");
      return;
    }
  };

  // ✅ Fetch Profile safely using MongoDB _id
  useEffect(() => {
    if (user?._id) {
      setIsLoading(true);
      api.get(`/users/${user._id}`) 
        .then((res) => setProfile(res.data))
        .catch((err) => {
          if (err.response?.status !== 404) {
            console.error("Profile fetch error:", err.message);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user?._id]);

  // ✅ GSAP Animations
  useEffect(() => {
    if (pathname === '/') {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.1 } });
      tl.fromTo(headingRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1 })
        .fromTo(subheadingRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.6")
        .fromTo(buttonRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.6");
    }
  }, [pathname]);

  return (
    <section className="relative bg-gradient-to-br from-blue-300 to-white text-center py-28 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 ref={headingRef} className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900">
          Your Trusted <span className="text-blue-600">Local Service Professionals</span>
        </h1>
        <p ref={subheadingRef} className="text-lg text-gray-700 mb-10">
          Connect with verified experts in your area for all your home service needs.
        </p>
         
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10" ref={buttonRef}>
          <Link
            href="/client/findworker"
            className="bg-white text-blue-600 hover:bg-gray-100 px-5 py-2 rounded-md font-medium shadow-sm transition-all"
          >
            Find a Professional
          </Link>  
          
          <button 
            onClick={handleJoinProfessional} 
            disabled={isLoading}
            className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-md font-medium cursor-pointer transition-all disabled:opacity-50"
          >
            {isLoading ? "Checking Status..." : "Join as a Professional"}
          </button>
        </div>
        <WorkerModel />
      </div>
    </section>
  );
}