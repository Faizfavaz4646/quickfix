'use client';

import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FaTools } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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


  const checkingLog = () => {
    if (!user) {
      router.push("/auth/signup?role=worker");
    } else if (user.role === "worker") {
      toast.info("You are already registered as a professional.");
      router.push("/worker/profile");
    } else {
      toast.info("You are logged in as a client. Please log out to join as a professional.");
    }
  };

  if (!isMounted) return null;

  return (
    <nav className="bg-white dark:bg-black shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
          <FaTools className="text-blue-600" />
          QuickFix
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">About</Link>
          <Link href="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Services</Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Contact</Link>
          <Link href="/client/find-worker" className="text-blue-600 font-semibold hover:underline">Find a Professional</Link>
          <button onClick={checkingLog} className="text-green-600 font-semibold hover:underline">Join as a Professional</button>
          {user ? (
            <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">Logout</button>

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
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">About</Link>
            <Link href="/services" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">Services</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">Contact</Link>
            <Link href="/client/find-worker" onClick={() => setIsOpen(false)} className="text-blue-600 font-semibold">Find a Professional</Link>
            <button onClick={() => { checkingLog(); setIsOpen(false); }} className="text-green-600 font-semibold text-left">Join as a Professional</button>
            {user ? (
             <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-red-600 font-semibold text-left">Logout</button>

            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-300">Login</Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="text-white bg-blue-600 px-4 py-2 rounded text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
