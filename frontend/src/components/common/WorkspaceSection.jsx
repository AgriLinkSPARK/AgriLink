function WorkspaceSection({ title, subtitle, badge, action, children, id }) {
  return (
    <section className="workspace-section" id={id}>
      <div className="workspace-section__header">
        <div>
          {badge ? <p className="workspace-section__badge">{badge}</p> : null}
          <h3>{title}</h3>
          {subtitle ? <p className="workspace-section__subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="workspace-section__action">{action}</div> : null}
      </div>
      <div className="workspace-section__body">{children}</div>
    </section>
  );
}

export default WorkspaceSection;