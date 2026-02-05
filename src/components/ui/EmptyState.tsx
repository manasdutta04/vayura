export default function EmptyState({
  title = "No data available yet",
  subtitle = "Try adjusting your filters"
}) {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-5xl mb-3">📭</div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}
