// utils/profile.ts
import { User } from "@/types/user";

export const getProfilePic = (user?: User | null) => {
  if (!user) return "/default-avatar.png";
  if (user.role === "client") return user.profile?.profilePic || "/default-client.png";
  return user.profilePic || "/default-worker.png";
};

export const getUserName = (user?: User | null, fallback = "Unknown") =>
  user?.name ?? fallback;
