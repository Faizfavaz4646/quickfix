export default function CompletedJobs() {
  return (
    <div className="border border-gray-200 w-full h-32 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out">
      <h3 className="font-semibold text-lg text-gray-800">Completed Jobs</h3>
      
      {/* Example static number */}
      <p className="mt-2 text-2xl font-bold text-green-600">24</p>
      
      <p className="text-sm text-gray-500">Total jobs completed</p>
    </div>
  );
}
