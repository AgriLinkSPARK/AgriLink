function PageCard({ title, subtitle, children, actions }) {
  return (
    <section className="mb-4 rounded-2xl border border-earth-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-slate-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default PageCard;