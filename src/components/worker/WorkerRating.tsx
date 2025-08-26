import { FiStar } from "react-icons/fi";

export default function WorkerRating() {
  return (
    <div className="w-full h-32 rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800">Rating</h3>
        {/* Star icon */}
        <FiStar className="text-yellow-500 w-6 h-6" />
      </div>

      <div className="flex items-center gap-1 mt-2">
        {/* Example static rating stars */}
        <span className="text-yellow-500">★</span>
        <span className="text-yellow-500">★</span>
        <span className="text-yellow-500">★</span>
        <span className="text-yellow-500">★</span>
        <span className="text-gray-400">★</span>
        <span className="ml-2 text-sm text-gray-600">4.0 / 5</span>
      </div>
    </div>
  );
}
