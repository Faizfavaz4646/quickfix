export default function ActiveJobs() {
  return (
    <div className="border border-gray-200 w-auto h-32 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out">
      <h3 className="font-semibold text-lg text-gray-800">Active Jobs</h3>
      
      {/* Example count */}
      <p className="mt-2 text-2xl font-bold text-blue-600">5</p>
      
      <p className="text-sm text-gray-500">Currently in progress</p>
    </div>
  );
}
