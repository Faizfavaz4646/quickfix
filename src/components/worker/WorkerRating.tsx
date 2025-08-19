export default function WorkerRating() {
  return (
    <div className="border border-gray-200 w-full h-32 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out">
      <h3 className="font-semibold text-lg text-gray-800">Rating</h3>
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
