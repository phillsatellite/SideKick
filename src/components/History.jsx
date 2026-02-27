import React from "react";
import "./History.css";

export default function History({ items, onSelect }) {
  return (
    <>
      <p className="history-label">Recent</p>
      <div className="history-list">
        {items.map((item, i) => (
          <button
            key={i}
            className="history-item"
            onClick={() => onSelect(item.text)}
          >
            <span className="history-item-text">{item.text}</span>
            <span className="history-item-time">{item.time}</span>
          </button>
        ))}
      </div>
    </>
  );
}