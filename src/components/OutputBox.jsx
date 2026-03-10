import "./OutputBox.css";

export default function OutputBox({ output, processing }) {
  return (
    <div className={`output-card${output ? " has-content" : ""}`}>
      <div className="output-body">
        {processing ? (
          <div className="output-processing">
            <div className="output-dot" />
            <div className="output-dot" />
            <div className="output-dot" />
          </div>
        ) : output ? (
          <div className="output-text">{output}</div>
        ) : (
          <p className="output-placeholder">
            Your formatted text will appear here after recording.
          </p>
        )}
      </div>
    </div>
  );
}
