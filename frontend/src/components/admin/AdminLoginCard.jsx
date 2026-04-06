import { AUTH_MODES } from "../../data/landingContent";

function AdminLoginCard({ form, loading, status, error, onChange, onSubmit }) {
  const activeMode = AUTH_MODES.admin;

  return (
    <div className={`auth-card theme-${activeMode.accent}`}>
      <p className="card-label">{activeMode.label}</p>
      <h2>{activeMode.title}</h2>
      <p className="card-copy">{activeMode.subtitle}</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange({ email: event.target.value })}
            placeholder="admin@agrilink.test"
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange({ password: event.target.value })}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Open admin dashboard"}
        </button>
      </form>

      {status ? <p className="status-text success">{status}</p> : null}
      {error ? <p className="status-text error">{error}</p> : null}
    </div>
  );
}

export default AdminLoginCard;