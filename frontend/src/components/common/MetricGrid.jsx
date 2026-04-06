function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.note}</small>
        </article>
      ))}
    </div>
  );
}

export default MetricGrid;