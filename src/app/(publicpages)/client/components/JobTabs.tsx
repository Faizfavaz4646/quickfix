interface JobCardProps {
  title: string;
  description: string;
  status: "pending" | "ongoing" | "completed";
  workerName?: string;
  date?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function JobCard({ title, description, status, workerName, date, onAction, actionLabel }: JobCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    ongoing: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>{status}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {workerName && <p className="text-xs text-gray-500">Worker: {workerName}</p>}
      {date && <p className="text-xs text-gray-400">Date: {new Date(date).toLocaleDateString()}</p>}
      {onAction && (
        <button onClick={onAction} className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
