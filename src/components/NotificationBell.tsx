"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { getMyNotifications, markNotificationAsRead } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Use your backend URL (not the API_URL, just the base domain)
const SOCKET_URL = "http://localhost:5001"; 

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const { user } = useAuthStore();
  const router = useRouter();

  // 1. Initial Fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // 2. Socket.io Connection
  useEffect(() => {
    if (!user) return;

    // Initialize Socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    // Register User ID
    socketRef.current.emit("register", user._id);

    // Listen for incoming notifications
    socketRef.current.on("notification", (newNotif: Notification) => {
      // Play sound
      const audio = new Audio("/sounds/notification.wav"); // Add a sound file to public/sounds
      audio.play().catch(e => console.log("Audio play failed", e));

      // Update State
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show Toast
      toast.info(newNotif.title, {
        description: newNotif.message,
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    const data = await getMyNotifications();
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.isRead).length);
  };

  const handleNotificationClick = async (notif: Notification) => {
    // 1. Mark as read in backend (Keep this same)
    if (!notif.isRead) {
      await markNotificationAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setIsOpen(false);

    // 2. ✅ NEW REDIRECT LOGIC
    if (notif.type === "job_request" || notif.type === "job_update") {
       
       // A. If user is a WORKER
       if (user?.role === 'worker') {
          router.push(`/worker/requests`); // Or /worker/pending
       } 
       
       // B. If user is a CLIENT (Redirect to your new page)
       else {
          const msg = notif.message.toLowerCase();
          
          if (msg.includes("accepted")) {
             // Go to Ongoing tab
             router.push("/client/requests?tab=ongoing");
          } else if (msg.includes("completed")) {
             // Go to History tab (to rate the worker)
             router.push("/client/requests?tab=completed");
          } else {
             // Default to the main list
             router.push("/client/requests");
          }
       } 
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white dark:border-black min-w-[18px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                 {unreadCount} new
               </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif._id}>
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                        !notif.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            !notif.isRead ? "bg-blue-600" : "bg-gray-300"
                        }`} />
                        <div>
                          <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}