'use client';

import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { FaTools, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { RiAccountPinCircleFill } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { MdOutlineRateReview } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
  profilePic?: string;
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Inside Navbar component
const handleJoinProfessional = () => {
  if (!user) {
    router.push("/auth/signup?role=worker");
    return;
  }

  if (profile?.role === "client") {
    toast.error("You are registered as a client. Please logout to register as a worker.");
    return;
  }

  if (profile?.role === "worker") {
    toast("You are already registered as a professional.");
    return;
  }
};


  useEffect(() => {
    setIsMounted(true);

    if (user) {
      axios
        .get(`http://localhost:50001/users/${user.id}`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const handleLogout = () => {
    toast("Are you sure you want to logout?", {
      action: {
        label: "Yes",
        onClick: () => {
          logout();
          router.push("/auth/login");
          toast.success("You have been logged out.");
        },
      },
      cancel: {
        label: "No",
        onClick: () => toast.dismiss(),
      },
      duration: 10000,
    });
  };

  const renderProfilePic = () => {
    if (!profile) return <FaUserCircle className="w-10 h-10 text-gray-600 cursor-pointer" />;

    const pic = profile.profile?.profilePic || '';
    return pic ? (
      <img
        src={pic}
        alt={profile.name}
        className="w-10 h-10 rounded-full object-cover border cursor-pointer"
      />
    ) : (
      <FaUserCircle className="w-10 h-10 text-gray-600 cursor-pointer" />
    );
  };

  if (!isMounted) return null;

  return (
    <nav className="bg-white dark:bg-black shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-black dark:text-white"
        >
        <FaTools className="text-blue-600" />
          QuickFix
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/publicpages/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">About</Link>
          <Link href="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Services</Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Contact</Link>
          <Link href="/client/findworker" className="font-semibold hover:underline">Find a Professional</Link>
          <button onClick={handleJoinProfessional} className="font-semibold hover:underline">Join as a Professional</button>
          
          {user ? (
            <div onClick={() => setShowModal(true)}>
              {renderProfilePic()}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Login</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-black dark:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 pb-4">
          <div className="flex flex-col gap-4 mt-2">
            <Link href="/publicpages/about" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">About</Link>
            <Link href="/services" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">Services</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-gray-700  dark:text-gray-300">Contact</Link>
            <Link href="/client/findworker" onClick={() => setIsOpen(false)} className="font-semibold">Find a Professional</Link>
            <button onClick={handleJoinProfessional} className="font-semibold text-left">Join as a Professional</button>

            {user ? (
              <div onClick={() => { setShowModal(true); setIsOpen(false); }}>
                {renderProfilePic()}
              </div>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">Login</Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="text-white bg-blue-600 px-4 py-2 rounded text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showModal && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40"></div>

          {/* Modal Box */}
          <div
            ref={modalRef}
            className="absolute right-6 top-16 w-72 bg-white rounded-xl shadow-lg z-50 p-4"
          >
            {/* Header with Close */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {renderProfilePic()}
                <div className="flex flex-col leading-tight">
                   <span className="font-medium">{profile?.name || user?.name}</span>
                <span className="text-sm text-blue-600">{user?.email}</span>

                </div>
               
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✖</button>
            </div>

            {/* Options */}
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => { router.push("/client/clientprofile-form"); setShowModal(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
               <span className='flex gap-1'><RiAccountPinCircleFill className='text-xl' /> Your Profile</span> 
 
                </button>
              </li>
              <li>
                <button
                  onClick={() => { router.push("/client/clientdashboard"); setShowModal(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
               <span className='flex gap-1'><MdDashboardCustomize className='text-xl' /> Dashboard</span> 
 
                </button>
              </li>
              <li>
                <button
                  onClick={() => { router.push("/settings"); setShowModal(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
                <span className='flex gap-1'><IoMdSettings className='text-xl' />Settings</span>  
                </button>
              </li>
              <li>
                <button
                  onClick={() => { router.push("/client/previous-requests"); setShowModal(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
               <span className='flex gap-1'><MdOutlineRateReview className='text-xl' />Previous Requests & Reviews</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { handleLogout(); setShowModal(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-600"
                >
               <span className='flex gap-1'><FaSignOutAlt className='text-xl' /> signout</span>  
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}
