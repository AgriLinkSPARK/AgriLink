function HomePortal({ onSelectPortal }) {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-earth-200 bg-white/85 shadow-soft backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,154,74,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(217,153,50,0.16),transparent_24%)]" />
        <div className="relative grid items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-earth-200 bg-earth-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-earth-700">
              <span className="h-2 w-2 rounded-full bg-earth-500" />
              Agri marketplace
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Fresh harvests. Fair prices.
              <span className="block text-earth-700">No middlemen.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Connect farmers and buyers directly in one marketplace. Browse fresh produce, manage orders, and grow your farm business with a clean, simple experience.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="rounded-xl bg-earth-600 px-5 py-3 font-semibold text-white transition hover:bg-earth-700" type="button" onClick={() => onSelectPortal("buyer")}>
                Shop as Buyer
              </button>
              <button className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-100" type="button" onClick={() => onSelectPortal("farmer")}>
                Sell as Farmer
              </button>
              <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:border-earth-300 hover:bg-earth-50" type="button" onClick={() => onSelectPortal("admin")}>
                Admin Access
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { value: "100%", label: "Direct trade" },
                { value: "24/7", label: "Online access" },
                { value: "Fast", label: "Order flow" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-earth-200 bg-white/90 px-4 py-4 shadow-sm">
                  <div className="text-2xl font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-[28px] border border-earth-200 bg-gradient-to-br from-earth-50 to-white p-5 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-700">Buyer portal</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Shop farm-fresh goods</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Login or register to browse produce, add to cart, and place orders directly from farmers.</p>
                <button className="mt-5 rounded-xl bg-earth-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-earth-700" type="button" onClick={() => onSelectPortal("buyer")}>
                  Go to Buyer
                </button>
              </article>

              <article className="mt-8 rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-soft sm:mt-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Farmer portal</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Sell your farm goods</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">List your products, manage your store, and receive orders from buyers without middlemen.</p>
                <button className="mt-5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700" type="button" onClick={() => onSelectPortal("farmer")}>
                  Go to Farmer
                </button>
              </article>

              <article className="mt-8 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-soft sm:mt-0 lg:mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">Admin portal</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Run the marketplace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Manage users, product listings, logistics, and keep the platform organized.</p>
                <button className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700" type="button" onClick={() => onSelectPortal("admin")}>
                  Go to Admin
                </button>
              </article>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                "Local farmers",
                "Fresh delivery",
                "Fair pricing",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Fresh from farms",
            text: "Highlight produce directly sourced from growers with no extra handling layers.",
          },
          {
            title: "Simple access",
            text: "Buyer and admin entry points are clear, visual, and easy to navigate.",
          },
          {
            title: "Trusted marketplace",
            text: "Manage listings, orders, and logistics in one calm dashboard experience.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-earth-200 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default HomePortal;