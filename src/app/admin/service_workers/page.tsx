"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAllUsers, toggleUserStatus } from "@/services/adminService";
import { User } from "@/types/user";
import { 
  Search, MoreVertical, ShieldAlert, ShieldCheck, 
  Mail, Calendar, Filter, UserX, UserCheck, Loader2 
} from "lucide-react";
import { format } from "date-fns";

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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
      toast.error("Failed to fetch system users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (user: User) => {
    const action = user.status === "blocked" ? "unblock" : "block";
    try {
      const updatedUser = await toggleUserStatus(user);
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      toast.success(`${updatedUser.name} is now ${updatedUser.status}`);
    } catch (err) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.emailId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Users</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Clients & Professionals</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none w-full sm:w-64 transition-all"
              />
           </div>
           <button onClick={loadUsers} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Filter size={18} className="text-slate-500" />
           </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="animate-spin text-indigo-600" size={32} />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 shrink-0">
                            <img
                              src={user.profile?.profilePic || "/images/avatar.avif"}
                              alt={user.name}
                              className="w-full h-full rounded-xl object-cover border border-slate-100 shadow-sm"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {user._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Email */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight border ${
                                user.role === 'worker' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                             }`}>
                               {user.role}
                             </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                             <Mail size={12} />
                             <span className="text-xs font-medium">{user.emailId || user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs font-semibold">
                            {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          user.status === "blocked" 
                            ? "bg-red-50 text-red-600 border border-red-100" 
                            : "bg-green-50 text-green-600 border border-green-100"
                        }`}>
                          {user.status === "blocked" ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                          {user.status || "active"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                         <button
                           onClick={() => handleToggle(user)}
                           className={`p-2 rounded-xl transition-all duration-200 ${
                             user.status === "blocked"
                               ? "text-green-600 bg-green-50 hover:bg-green-100"
                               : "text-red-500 bg-red-50 hover:bg-red-100"
                           }`}
                           title={user.status === "blocked" ? "Unblock User" : "Block User"}
                         >
                           {user.status === "blocked" ? <UserCheck size={18} /> : <UserX size={18} />}
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <Search className="text-slate-200" size={48} />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No users found</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}