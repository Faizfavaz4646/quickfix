type GraphCardProps = {
  title: string;
  children?: React.ReactNode;
};

export default function GraphCard({ title, children }: GraphCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80 flex items-center justify-center">
        {children ?? <p className="text-gray-400">[Graph Component Here]</p>}
      </div>
    </div>
  );
}
