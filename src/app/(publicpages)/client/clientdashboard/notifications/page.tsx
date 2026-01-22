"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyNotifications, markNotificationAsRead } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { toast } from "sonner";
import { Bell, Check, Clock, AlertCircle, Briefcase, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getMyNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );

    // API Call
    await markNotificationAsRead(id);
    toast.success("Marked as read");
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) handleMarkAsRead(notif._id);

    // Redirect logic based on type
    if (notif.type === "job_request" || notif.type === "job_update") {
      router.push("/client/previous-requests");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "job_request": return <Briefcase className="text-blue-500" />;
      case "job_update": return <AlertCircle className="text-orange-500" />;
      case "system": return <Info className="text-gray-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => 
    filter === "all" ? true : !n.isRead
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 flex justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="text-blue-600" /> Notifications
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Stay updated with your job requests and account activity.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "all" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "unread" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Bell className="mx-auto h-12 w-12 text-gray-200 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative flex gap-4 p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  notif.isRead 
                    ? "bg-white border-gray-100" 
                    : "bg-blue-50/40 border-blue-100 shadow-sm"
                }`}
              >
                {/* Icon Container */}
                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                   notif.isRead ? "bg-gray-100" : "bg-white border border-blue-100 shadow-sm"
                }`}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-base ${notif.isRead ? "font-medium text-gray-900" : "font-bold text-blue-900"}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1 ml-2">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`mt-1 text-sm ${notif.isRead ? "text-gray-500" : "text-gray-700"}`}>
                    {notif.message}
                  </p>
                </div>

                {/* Actions */}
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif._id);
                    }}
                    className="absolute bottom-4 right-4 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded-md shadow-sm"
                  >
                    <Check size={14} /> Mark Read
                  </button>
                )}
                
                {/* Unread Dot Indicator */}
                {!notif.isRead && (
                  <span className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50/50"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}