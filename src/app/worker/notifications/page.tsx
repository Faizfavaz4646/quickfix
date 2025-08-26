"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import {
  getWorkerProfile,
  markNotificationSeen,
  deleteNotification,
} from "@/services/workerService";
import {
  useAuthStore,
  useNotificationStore,
  Profile,
  Notification,
  Request,
} from "@/store/authStore";
import { toast } from "sonner";

type EnrichedNotification = Notification & {
  name: string;
  contact: string;
  description: string;
};

export default function WorkerNotificationsPage() {
  const { user } = useAuthStore();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<EnrichedNotification | null>(null);

  const resetCount = useNotificationStore((state) => state.resetCount);

  // Reset count when page mounts
  useEffect(() => {
    resetCount();
  }, []);

  // Fetch notifications + requests
  useEffect(() => {
    if (!user || user.role !== "worker") return;

    setLoading(true);
    getWorkerProfile(user.id.toString())
      .then((data) => {
        if (!data) return;
        if (data) setWorkerProfile(data);

        const unseen =
          data.notifications?.filter((n: Notification) => !n.seen).length || 0;
        useNotificationStore.getState().setCount(unseen);
      })
      .catch((err) => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user || user.role !== "worker") {
    return <p className="p-4">You must be logged in as a worker.</p>;
  }

  if (loading) return <p className="p-4">Loading notifications...</p>;

  const notifications: Notification[] = workerProfile?.notifications || [];
  const requests: Request[] = workerProfile?.requests || [];

  // Merge notifications with matching requests
  const enrichedNotifications: EnrichedNotification[] = notifications.map(
    (n) => {
      const req = requests.find((r) => r.id === n.id);
      return {
        ...n,
        name: req?.name || "Unknown",
        contact: req?.contact || "N/A",
        description: req?.description || "No description",
      };
    }
  );

  const handleOpenNotification = async (n: EnrichedNotification) => {
    setSelectedNotification(n);

    if (!n.seen && user) {
      await markNotificationSeen(user.id.toString(), n.id);

      // update local state
      setWorkerProfile((prev) =>
        prev
          ? {
              ...prev,
              notifications: prev.notifications?.map((notif) =>
                notif.id === n.id ? { ...notif, seen: true } : notif
              ),
            }
          : prev
      );

      // update navbar count instantly
      const unseen = enrichedNotifications.filter(
        (x) => !x.seen && x.id !== n.id
      ).length;
      useNotificationStore.getState().setCount(unseen);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!user) return;
    try {
      const updated = await deleteNotification(user.id.toString(), id);

      setWorkerProfile((prev) =>
        prev ? { ...prev, notifications: updated } : prev
      );

      toast.success("Notification deleted!");
      useNotificationStore.getState().setCount(
        updated.filter((n) => !n.seen).length
      );
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete notification.");
    }
  };

 return (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
    {/* Heading */}
    <h1 className="text-2xl sm:text-3xl font-bold text-center flex items-center justify-center gap-3 mb-8">
      <Bell className="w-7 h-7 text-yellow-500" /> Notifications
    </h1>

    {/* No notifications */}
    {enrichedNotifications.length === 0 ? (
      <p className="text-gray-500 text-center text-lg">No notifications yet.</p>
    ) : (
      <ul className="space-y-4">
        {enrichedNotifications
          .slice()
          .reverse()
          .map((n) => (
            <li
              key={n.id}
              className={`flex items-center justify-between w-full rounded-md shadow-lg border border-gray-200 px-4 py-3 transition ${
                n.seen ? "bg-gray-100" : "bg-yellow-50"
              }`}
            >
              {/* Icon + Text */}
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => handleOpenNotification(n)}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-white ${
                    n.seen ? "bg-gray-400" : "bg-yellow-500"
                  }`}
                >
                  <Bell className="w-4 h-4 text-yellow-300" />
                </div>

                {/* Text */}
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-800">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    from <span className="font-semibold">{n.name}</span> •{" "}
                    {new Date(n.date).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Close/Delete button */}
              <button
                className="ml-3 text-gray-400 hover:text-red-600"
                onClick={() => handleDeleteNotification(n.id)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
      </ul>
    )}

    {/* Notification Details Modal */}
    {selectedNotification && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl max-w-md w-full relative shadow-xl">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedNotification(null)}
          >
            ✕
          </button>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">
            <strong>Name:</strong> {selectedNotification.name}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            <strong>Contact:</strong> {selectedNotification.contact}
          </p>
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            <strong>Description:</strong> {selectedNotification.description}
          </p>
          <p className="text-xs text-gray-500 mt-3">
            {new Date(selectedNotification.date).toLocaleString()}
          </p>  
        </div>
      </div>
    )}
  </div>
);


}
