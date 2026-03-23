export default function SkeletonCard({ lines = 3, width = '100%' }) {
  return (
    <div className="card p-3" style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: i < lines - 1 ? 10 : 0, width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}
