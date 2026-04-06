function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

export default EmptyState;