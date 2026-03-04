import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { generateFile } from "../utils/exportFile";
import {
  isGoogleAvailable,
  initTokenClient,
  requestAccessToken,
  getAccessToken,
  uploadToDrive,
} from "../utils/googleDrive";
import { CloseIcon, FileIcon, DownloadIcon, DriveIcon } from "./Icons";
import { useEscapeKey } from "../hooks/useEscapeKey";
import "./ExportModal.css";

const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "DOCX" },
  { id: "txt", label: "TXT" },
  { id: "md", label: "MD" },
];

export default function ExportModal({ output, onClose }) {
  const [format, setFormat] = useState("pdf");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [driveLinked, setDriveLinked] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (getAccessToken()) {
      setDriveLinked(true);
    } else if (isGoogleAvailable()) {
      initTokenClient(
        () => setDriveLinked(true),
        () => {}
      );
    }
  }, []);

  useEscapeKey(onClose);

  const closeTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
  }, []);

  const handleSaveToComputer = async () => {
    setExporting(true);
    setError("");
    try {
      const { blob, filename } = await generateFile(output, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("File downloaded!");
      closeTimerRef.current = setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportToDrive = async () => {
    setError("");

    if (!driveLinked) {
      if (!isGoogleAvailable()) {
        setError("Google Drive is not configured. A Google Cloud client ID is required.");
        return;
      }
      requestAccessToken();
      return;
    }

    setExporting(true);
    try {
      const { blob, filename, mimeType } = await generateFile(output, format);
      await uploadToDrive(blob, filename, mimeType);
      setSuccess("Uploaded to Google Drive!");
      closeTimerRef.current = setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return createPortal(
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <span className="export-modal-title">Export</span>
          <button className="export-close-btn" onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="export-section">
          <span className="export-section-label">Format</span>
          <div className="export-format-grid">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`export-format-btn${format === opt.id ? " selected" : ""}`}
                onClick={() => setFormat(opt.id)}
              >
                <FileIcon />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="export-section">
          <span className="export-section-label">Destination</span>
          <div className="export-dest-stack">
            <button
              className="export-dest-btn primary"
              onClick={handleSaveToComputer}
              disabled={exporting}
            >
              <DownloadIcon />
              <span>Save to computer</span>
            </button>
            <button
              className="export-dest-btn"
              onClick={handleExportToDrive}
              disabled={exporting}
            >
              <DriveIcon />
              <span>{driveLinked ? "Export to Google Drive" : "Connect Google Drive"}</span>
            </button>
          </div>
        </div>

        {error && <p className="export-error">{error}</p>}
        {success && <p className="export-success">{success}</p>}
      </div>
    </div>,
    document.body
  );
}
