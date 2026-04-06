import { DEMO_CREDENTIALS } from "../../data/landingContent";

function HeroPanel() {
  return (
    <section className="hero-panel">
      <div className="brand-row">
        <div className="brand-mark">A</div>
        <div>
          <p className="eyebrow">AgriLink control tower</p>
          <h1>Buyer and admin access in one focused interface.</h1>
        </div>
      </div>

      <p className="hero-copy">
        Use the buyer login for customers placing orders and tracking deliveries.
        Use the admin login to monitor users, listings, and operational health.
      </p>

      <div className="hero-points">
        <div>
          <span>Buyer flow</span>
          <strong>Orders, favorites, and support</strong>
        </div>
        <div>
          <span>Admin flow</span>
          <strong>Users, approvals, and platform metrics</strong>
        </div>
      </div>

      <div className="sample-block">
        <p>Demo credentials</p>
        <div>
          <span>Buyer</span>
          <strong>{DEMO_CREDENTIALS.buyer.email}</strong>
        </div>
        <div>
          <span>Admin</span>
          <strong>{DEMO_CREDENTIALS.admin.email}</strong>
        </div>
      </div>
    </section>
  );
}

export default HeroPanel;