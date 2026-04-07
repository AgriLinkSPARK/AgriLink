function AuthPanel({ mode, view, form, loading, error, onModeChange, onViewChange, onChange, onSubmit, onBack }) {
  const isBuyer = mode === "buyer";
  const isFarmer = mode === "farmer";
  const isRegister = view === "register";
  const title = isBuyer 
    ? (isRegister ? "Create buyer account" : "Buyer login")
    : isFarmer
    ? (isRegister ? "Register as farmer" : "Farmer login")
    : "Admin login";
  const subtitle = isBuyer
    ? isRegister
      ? "Register to browse products, manage cart, and place orders."
      : "Sign in to continue to your buyer workspace."
    : isFarmer
    ? isRegister
      ? "Register to list your products and manage orders from buyers."
      : "Sign in to manage your farm store and products."
    : "Sign in to manage users, products, and logistics.";

  return (
    <section className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[28px] border border-earth-200 bg-white shadow-soft">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <aside className="relative overflow-hidden bg-gradient-to-br from-earth-700 via-earth-600 to-amber-500 p-8 text-white md:p-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">AgriLink Marketplace</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">Direct farm-to-buyer commerce, without middlemen.</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/85">Buy fresh produce directly from farmers. Admins manage the marketplace, buyers shop quickly, and everyone stays connected in one place.</p>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-lg font-bold">Buy</div>
                  <div className="text-white/80">Fresh products</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-lg font-bold">Sell</div>
                  <div className="text-white/80">Fair value</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-lg font-bold">Manage</div>
                  <div className="text-white/80">Fast workflows</div>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-6 md:p-8">
            {onBack ? (
              <button className="mb-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onBack}>
                Back to home
              </button>
            ) : null}

            <div className="mb-5 space-y-4">
              <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  className={mode === "buyer"
                    ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                    : "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"}
                  type="button"
                  onClick={() => onModeChange("buyer")}
                >
                  Buyer
                </button>
                <button
                  className={mode === "farmer"
                    ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                    : "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"}
                  type="button"
                  onClick={() => onModeChange("farmer")}
                >
                  Farmer
                </button>
                <button
                  className={mode === "admin"
                    ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                    : "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"}
                  type="button"
                  onClick={() => onModeChange("admin")}
                >
                  Admin
                </button>
              </div>

              {(isBuyer || isFarmer) ? (
                <div className="inline-flex rounded-2xl bg-earth-50 p-1">
                  <button
                    className={view === "login"
                      ? "rounded-xl bg-earth-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                      : "rounded-xl px-4 py-2 text-sm font-semibold text-earth-700 transition hover:bg-earth-100"}
                    type="button"
                    onClick={() => onViewChange("login")}
                  >
                    Login
                  </button>
                  <button
                    className={view === "register"
                      ? "rounded-xl bg-earth-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                      : "rounded-xl px-4 py-2 text-sm font-semibold text-earth-700 transition hover:bg-earth-100"}
                    type="button"
                    onClick={() => onViewChange("register")}
                  >
                    Register
                  </button>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">AgriLink</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
                <p className="mt-2 max-w-xl text-slate-600">{subtitle}</p>
              </div>
            </div>

            <form className="grid gap-4" onSubmit={onSubmit}>
              {(isBuyer || isFarmer) && isRegister ? (
                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-slate-700">Name</span>
                  <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" name="name" value={form.name} onChange={(event) => onChange(event.target.name, event.target.value)} required />
                </label>
              ) : null}

              <label className="grid gap-1">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" type="email" name="email" value={form.email} onChange={(event) => onChange(event.target.name, event.target.value)} required />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" type="password" name="password" value={form.password} onChange={(event) => onChange(event.target.name, event.target.value)} required />
              </label>

              <button className="rounded-xl bg-earth-600 px-4 py-3 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={loading}>
                {loading ? "Please wait..." : isBuyer && isRegister ? "Create account" : isFarmer && isRegister ? "Register farm" : "Sign in"}
              </button>
            </form>

            {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

            <p className="mt-4 text-xs text-slate-500">Buyer, farmer, and admin use different portals. Switch above to change the login flow.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthPanel;