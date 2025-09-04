import { FiBriefcase, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface Props {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function DashboardSummary({ total, pending, inProgress, completed }: Props) {
  const cards = [
    { label: "Total Requests", value: total, icon: <FiBriefcase />, color: "text-blue-600" },
    { label: "Pending", value: pending, icon: <FiAlertCircle />, color: "text-yellow-600" },
    { label: "In Progress", value: inProgress, icon: <FiClock />, color: "text-purple-600" },
    { label: "Completed", value: completed, icon: <FiCheckCircle />, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <div key={i} className="p-4 rounded-xl bg-white shadow flex flex-col items-center">
          <div className={`text-2xl mb-2 ${c.color}`}>{c.icon}</div>
          <p className="text-xl font-bold">{c.value}</p>
          <p className="text-gray-500 text-sm">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
