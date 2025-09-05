type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down";
};

export default function StatCard({ title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {change && (
        <span
          className={`text-xs ${
            changeType === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </span>
      )}
    </div>
  );
}
