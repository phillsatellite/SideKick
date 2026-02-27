import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { generateFile } from "../utils/exportFile";
import {
  isGoogleAvailable,
  initTokenClient,
  requestAccessToken,
  getAccessToken,
  uploadToDrive,
} from "../utils/googleDrive";
import "./ExportModal.css";

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DriveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 19.5h20L12 2z" />
    <path d="M2 19.5l5-8.5h14" />
    <path d="M16 11L22 19.5" />
  </svg>
);

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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
      setTimeout(onClose, 1200);
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
      setTimeout(onClose, 1500);
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
