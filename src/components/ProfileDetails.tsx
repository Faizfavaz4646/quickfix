import { FaMapMarkerAlt } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { Profile } from "@/types/user";
import RequestDialog from "./RequestDialog";

interface ProfileCardProps {
  worker: Profile;
}

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
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <AiFillStar key={`full-${i}`} />
        ))}
      {halfStar && <AiFillStar key="half" className="text-yellow-400/50" />}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <AiFillStar key={`empty-${i}`} className="text-gray-300" />
        ))}

      {/* Show numeric rating */}
      <span className="ml-2 text-gray-600 text-xs">
        {rating > 0 ? rating.toFixed(1) + "/5" : "No Ratings"}
      </span>
    </div>
  );
};

export default function ProfileCard({ worker }: ProfileCardProps) {
  const avgRating = getAverageRating(worker.ratings);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col items-center md:items-start">
        <img
          src={worker.profilePic || "/images/avatar.avif"}
          alt={worker.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
        />

        {/* Worker Name */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-3">
          {worker.name}
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
      </div>

      {/* RequestDialog handles its own button + dialog */}
      <div className="flex flex-col justify-center">
        {worker.id !== undefined && (
          <RequestDialog workerId={String(worker.id)} />
        )}
      </div>
    </div>
  );
}
