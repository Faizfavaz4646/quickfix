import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { User,Profile } from "@/types/user";

interface ProfileCardProps {
  worker: Profile;

 
  onRequest: () => void;
}

export default function ProfileCard({worker, onRequest }: ProfileCardProps) {
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

      <div className="flex flex-col justify-center">
        <button
          onClick={onRequest}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          <FaMessage /> Request Job
        </button>
      </div>
    </div>
  );
}
