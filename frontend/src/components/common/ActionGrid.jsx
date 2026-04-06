function ActionGrid({ actions }) {
  return (
    <div className="action-grid">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`action-card tone-${action.tone || "neutral"}`}
          onClick={action.onClick}
        >
          <span>{action.label}</span>
          {action.helper ? <small>{action.helper}</small> : null}
        </button>
      ))}
    </div>
  );
}

export default ActionGrid;