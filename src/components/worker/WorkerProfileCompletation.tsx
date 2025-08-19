export default function ProfileCompletion() {
  return (
    <div className="border border-gray-200 w-auto h-40 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out">
      <h3 className="font-semibold text-lg text-gray-800">Profile Completion</h3>
      <p className="text-sm text-gray-500 mt-2">
        Your profile is 70% complete. Add more details to increase visibility.
      </p>
      {/* Example progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div className="bg-blue-500 h-2 rounded-full w-[70%]"></div>
      </div>
    </div>
  );
}
