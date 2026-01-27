import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import RequestDialog from "./RequestDialog";

// Using 'any' to safely access nested properties regardless of backend format
interface ProfileCardProps {
  worker: any; 
}

// ✅ 1. ADD HELPER: Fixes broken image links
const getImageUrl = (path?: string) => {
  if (!path) return "/images/avatar.avif"; // Default fallback
  
  // If it's already a full URL (Cloudinary/Google), use it as is
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }
  
  // If it's a local file, prepend backend URL
  // Remove leading slash to avoid double slashes (e.g. //uploads)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `http://localhost:5001/${cleanPath}`;
};

// --- Helpers ---
const getAverageRating = (ratings?: number[]) => {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return total / ratings.length;
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400 text-sm mt-1">
      {Array(fullStars).fill(0).map((_, i) => (
          <AiFillStar key={`full-${i}`} />
      ))}
      {halfStar && <AiFillStar key="half" className="text-yellow-400/50" />}
      {Array(emptyStars).fill(0).map((_, i) => (
          <AiFillStar key={`empty-${i}`} className="text-gray-300" />
      ))}
      <span className="ml-2 text-gray-600 text-xs">
        {rating > 0 ? rating.toFixed(1) + "/5" : "No Ratings"}
      </span>
    </div>
  );
};

export default function ProfileCard({ worker }: ProfileCardProps) {
  const avgRating = getAverageRating(worker.ratings);

  // 1. Resolve Display Name
  const displayName = worker.userId?.name || worker.name || "Service Provider";
  
  // 2. ✅ FIX: Use the Helper to resolve the image
  const rawImage = worker.profilePic || worker.userId?.profilePic;
  const displayImage = getImageUrl(rawImage);

  // 3. Resolve the Correct Target User ID
  const targetUserId = (typeof worker.userId === 'string') 
    ? worker.userId 
    : (worker.userId?._id || worker._id);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col items-center md:items-start">
      
        {/* ✅ ADDED onError: If link breaks, show default avatar */}
        <img
          src={displayImage}
          alt={displayName}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 bg-gray-100"
          onError={(e) => (e.currentTarget.src = "/images/avatar.avif")}
        />

        {/* Worker Name */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-3">
          {displayName}
        </h2>

        {/* Rating Stars */}
        {renderStars(avgRating)}

        {/* Profession */}
        <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm mt-2">
          {worker.profession || "No Profession Added"}
        </span>

        {/* Location */}
        <p className="flex items-center gap-2 text-gray-500 mt-2">
          <FaMapMarkerAlt className="text-blue-500" />
          {worker.state}, {worker.district}, {worker.city}
        </p>
        
        {/* Phone */}
        <span className="flex gap-2 items-center">
            <FaPhone className="mt-1 text-blue-500" />
            <p className="text-gray-500">{worker.phone}</p>
        </span>
      </div>

      {/* Right Side: Request Dialog */}
      <div className="flex flex-col justify-center ml-auto">
        {worker && (
          <RequestDialog 
            workerId={targetUserId} 
            workerName={displayName}
            workerPic={displayImage} // Pass the fixed URL here too
          />
        )}
      </div>
    </div>
  );
}