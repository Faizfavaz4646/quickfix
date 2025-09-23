"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAllUsers, toggleUserStatus } from "@/services/adminService";
import { User } from "@/types/user";

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (user: User) => {
    if (!user) return;
    try {
      const updatedUser = await toggleUserStatus(user);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      toast.success(
        `${updatedUser.name} has been ${
          updatedUser.status === "blocked" ? "blocked" : "unblocked"
        }`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-gray-50 p-2 sm:p-4 lg:ml-64 lg:p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500 text-sm sm:text-base">
            Loading users...
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Desktop Table */}
          <div className="hidden sm:block flex-1 overflow-x-auto shadow-sm rounded-lg">
            <table className="w-full bg-white rounded-lg text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-medium">Profile</th>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Role</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        {user.profile?.profilePic ? (
                          <img
                            src={user.profile.profilePic}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-400 rounded-full text-white font-semibold text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-gray-700 font-medium">
                        {user.name}
                      </td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3 capitalize text-gray-600">
                        {user.role}
                      </td>
                      <td
                        className={`p-3 font-medium ${
                          user.status === "blocked"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {user.status ?? "active"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggle(user)}
                          className={`px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors duration-200 text-xs ${
                            user.status === "blocked"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {user.status === "blocked" ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center p-8 text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden flex-1 overflow-y-auto space-y-3 pb-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3 mb-2">
                    {user.profile?.profilePic ? (
                      <img
                        src={user.profile.profilePic}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-400 rounded-full text-white font-semibold text-base flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                        {user.name}
                      </h3>
                      <p className="text-gray-600 text-xs truncate mb-1">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "worker"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "blocked"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.status ?? "active"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleToggle(user)}
                      className={`w-full py-2 px-3 rounded-lg font-medium shadow-sm transition-colors duration-200 text-sm ${
                        user.status === "blocked"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {user.status === "blocked" ? "Unblock User" : "Block User"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center min-h-[40vh] bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-medium mb-1">No users found</h3>
                  <p className="text-sm text-gray-400">
                    There are no users to display at the moment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
