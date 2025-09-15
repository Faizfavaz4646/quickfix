"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getClientProfile } from "@/services/workerService";
import axios from "axios";
import { toast } from "sonner";
import { FiBell, FiTrash2, FiCheck } from "react-icons/fi";

const API_URL = "http://localhost:50001";

type Notification = {
  id: number;
  message: string;
  seen: boolean;
  date: string;
};

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const profile = await getClientProfile(user.id.toString());
        setNotifications(profile?.profile?.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Mark as read
  const handleMarkAsRead = async (notifId: number) => {
    try {
      const updated = notifications.map((n) =>
        n.id === notifId ? { ...n, seen: true } : n
      );
      setNotifications(updated);

      await axios.patch(`${API_URL}/users/${user?.id}`, {
        profile: {
          ...user?.profile,
          notifications: updated,
        },
      });

      toast.success("Notification marked as read ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification ❌");
    }
  };

  // Delete notification
  const handleDelete = async (notifId: number) => {
    try {
      const updated = notifications.filter((n) => n.id !== notifId);
      setNotifications(updated);

      await axios.patch(`${API_URL}/users/${user?.id}`, {
        profile: {
          ...user?.profile,
          notifications: updated,
        },
      });

      toast.success("Notification deleted 🗑️");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification ❌");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-40">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen mt-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <FiBell className="text-blue-500" />
        Notifications
      </h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border shadow-sm flex justify-between items-start ${
                  notif.seen ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <div>
                  <p
                    className={`${
                      notif.seen ? "text-gray-600" : "text-gray-900 font-semibold"
                    }`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.date).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notif.seen && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
