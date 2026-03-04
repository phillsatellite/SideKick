export default function FormatsTab({ presets, onToggle }) {
  return (
    <div className="settings-formats">
      <p className="settings-formats-description">
        Voice commands that control how your text is formatted.
        Say these keywords while recording to trigger formatting.
      </p>
      <div className="settings-presets-list">
        {presets.map((preset) => (
          <div key={preset.id} className="settings-preset-row">
            <div className="settings-preset-info">
              <span className="settings-preset-keyword">"{preset.keyword}"</span>
              <span className="settings-preset-desc">{preset.description}</span>
            </div>
            <button
              className={`settings-toggle${preset.enabled ? " on" : ""}`}
              onClick={() => onToggle(preset.id)}
              role="switch"
              aria-checked={preset.enabled}
              aria-label={`Toggle ${preset.keyword}`}
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
