import { FaMapMarkerAlt } from "react-icons/fa";
import { Profile } from "@/types/user";
import RequestDialog from "./RequestDialog";

interface ProfileCardProps {
  worker: Profile;
}

export default function ProfileCard({ worker }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col items-center md:items-start">
        <img
          src={worker.profilePic || "/images/avatar.avif"}
          alt={worker.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
        />
        <h2 className="text-2xl font-semibold text-gray-800 mt-3">{worker.name}</h2>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm mt-2">
          {worker.profession || "No Profession Added"}
        </span>
        <p className="flex items-center gap-2 text-gray-500 mt-2">
          <FaMapMarkerAlt className="text-blue-500" />
          {worker.state}, {worker.district}, {worker.city}
        </p>
      </div>

      {/* RequestDialog handles its own button + dialog */}
      <div className="flex flex-col justify-center">
      {worker.id !== undefined && <RequestDialog workerId={worker.id} />}
      </div>
    </div>
  );
}
