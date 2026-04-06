import { AUTH_MODES } from "../../data/landingContent";

function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher" role="tablist" aria-label="Choose login type">
      {Object.values(AUTH_MODES).map((option) => (
        <button
          key={option.key}
          type="button"
          className={mode === option.key ? "mode-button active" : "mode-button"}
          onClick={() => onChange(option.key)}
        >
          <span>{option.label}</span>
          <small>{option.subtitle}</small>
        </button>
      ))}
    </div>
  );
}

export default ModeSwitcher;