"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import styles from "./page.module.css";
import { CodeXml, Copy, Check } from "lucide-react";

// Dynamically import MapViewer to prevent SSR issues with Leaflet
const MapViewer = dynamic(() => import("../components/MapViewer"), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#030509', color: '#14b8a6', letterSpacing: '0.2em' }}>
      LOADING MAP ENGINE...
    </div>
  ),
});

export default function Dashboard() {
  const [selectedBounds, setSelectedBounds] = useState<L.LatLngBounds | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  const minX = selectedBounds ? Math.min(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const maxX = selectedBounds ? Math.max(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const minY = selectedBounds ? Math.min(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";
  const maxY = selectedBounds ? Math.max(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";
  
  // Z-Coordinates adjust based on Flying Vehicles toggle
  const minZ = selectedBounds ? (isFlying ? "150.0000" : "-100.0000") : "0.0000";
  const maxZ = selectedBounds ? (isFlying ? "1200.0000" : "500.0000") : "0.0000";

  const handleCopy = () => {
    if (!selectedBounds) {
      alert("Please select a zone on the map first.");
      return;
    }
    const output = `Min(X: ${minX}, Y: ${minY}, Z: ${minZ})\nMax(X: ${maxX}, Y: ${maxY}, Z: ${maxZ})`;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <main className={styles.container}>
      
      <header className={styles.header}>
        <div className={styles.subtitle}>zone selector tool</div>
        <h1 className={styles.title}>SA-MP xyz calculator</h1>
        <div style={{ color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          select zone in the map
        </div>
      </header>

      <div className={styles.mapWrapper}>
        <MapViewer onSelection={setSelectedBounds} currentSelection={selectedBounds} />
      </div>

      <div className={styles.controlsPanel}>
        
        <div className={styles.dataGroup}>
          <div className={styles.groupLabel}>Minimum Zone Boundary</div>
          <div className={styles.inputsRow}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN X</span>
              <input readOnly value={minX} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN Y</span>
              <input readOnly value={minY} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN Z</span>
              <input readOnly value={minZ} className={styles.inputField} />
            </div>
          </div>
        </div>

        <div className={styles.dataGroup}>
          <div className={styles.groupLabel}>Maximum Zone Boundary</div>
          <div className={styles.inputsRow}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX X</span>
              <input readOnly value={maxX} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX Y</span>
              <input readOnly value={maxY} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX Z</span>
              <input readOnly value={maxZ} className={styles.inputField} />
            </div>
          </div>
        </div>

        <div className={styles.optionsPanel}>
          <label className={styles.toggleContainer}>
            <input 
              type="checkbox" 
              checked={isFlying} 
              onChange={(e) => setIsFlying(e.target.checked)} 
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleLabel}>FLYING VEHICLES</span>
          </label>
        </div>

        <button className={styles.copyButton} onClick={handleCopy}>
          {isCopied ? <Check size={28} /> : <Copy size={28} />}
          <span>{isCopied ? "COPIED" : "COPY"}</span>
        </button>

      </div>

    </main>
  );
}
