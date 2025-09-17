"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Worker, fetchAllWorkers, toggleWorkerStatus } from "@/services/adminService";

export default function ServiceWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllWorkers();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch workers.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleToggle = async (worker: Worker) => {
    try {
      await toggleWorkerStatus(worker);
      toast.success(
        `${worker.name} has been ${worker.status === "blocked" ? "unblocked" : "blocked"}`
      );
      loadWorkers(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to update worker status.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Service Workers</h1>

      {loading ? (
        <p className="text-gray-500">Loading workers...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.length > 0 ? (
                workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-gray-200 hover:bg-gray-50">
                    {/* Profile Pic */}
                    <td className="p-3">
                      {worker.profile?.profilePic ? (
                        <img
                          src={worker.profile.profilePic}
                          alt={worker.name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-300 rounded-full text-white font-bold">
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* Worker Info */}
                    <td className="p-3">{worker.name}</td>
                    <td className="p-3">{worker.email}</td>
                    <td className="p-3">{worker.role}</td>
                    <td className="p-3 capitalize">{worker.status || "active"}</td>

                    {/* Block / Unblock */}
                    <td className="p-3">
                      <button
                        onClick={() => handleToggle(worker)}
                        className={`px-3 py-1 rounded font-medium ${
                          worker.status === "blocked"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {worker.status === "blocked" ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No service workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
