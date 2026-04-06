function StatGrid({ items }) {
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article className="rounded-2xl border border-earth-200 bg-gradient-to-b from-white to-earth-50 p-4 shadow-soft" key={item.label}>
          <span className="text-xs font-semibold uppercase tracking-wide text-earth-700">{item.label}</span>
          <strong className="mt-2 block text-3xl font-extrabold tracking-tight text-slate-900">{item.value}</strong>
          <small className="text-slate-600">{item.note}</small>
        </article>
      ))}
    </div>
  );
}

export default StatGrid;