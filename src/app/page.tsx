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
  const [mapType, setMapType] = useState<'sa' | 'v'>('sa');
  const [selectedBounds, setSelectedBounds] = useState<L.LatLngBounds | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  // Dynamic bounds based on map type
  // GTASA: -3000 to 3000
  // GTAV: Roughly -8000 to 8000 (standardized here for the tiled map)
  const minX = selectedBounds ? Math.min(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const maxX = selectedBounds ? Math.max(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const minY = selectedBounds ? Math.min(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";
  const maxY = selectedBounds ? Math.max(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";

  // Z-Coordinates adjust based on Flying Vehicles toggle and map type
  const minZ = selectedBounds ? (isFlying ? "150.0000" : (mapType === 'sa' ? "-100.0000" : "-1000.0000")) : "0.0000";
  const maxZ = selectedBounds ? (isFlying ? "1200.0000" : (mapType === 'sa' ? "500.0000" : "2000.0000")) : "0.0000";

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
        <div className={styles.subtitle}>MapSync</div>
        <h1 className={styles.title}>XYZ CALCULATOR</h1>

        <div className={styles.mapSwitcher}>
          <button
            className={`${styles.switchBtn} ${mapType === 'sa' ? styles.activeSwitch : ''}`}
            onClick={() => { setMapType('sa'); setSelectedBounds(null); }}
          >
            SA-MP (GTA SA)
          </button>
          <button
            className={`${styles.switchBtn} ${mapType === 'v' ? styles.activeSwitch : ''}`}
            onClick={() => { setMapType('v'); setSelectedBounds(null); }}
          >
            FIVEM (GTA V)
          </button>
        </div>

        <div style={{ color: "var(--text-secondary)", letterSpacing: "0.05em" }}>
          select zone in the map
        </div>
      </header>

      <div className={styles.mapWrapper}>
        <MapViewer
          onSelection={setSelectedBounds}
          currentSelection={selectedBounds}
          mapType={mapType}
        />
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

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <img
            src="https://www.gta-multiplayer.cz/images/avatars/MP-6.png"
            alt="Shreyash Avatar"
            className={styles.footerAvatar}
          />
          <div className={styles.footerText}>
            <span className={styles.footerCredit}>Created by <strong>Shreyash</strong></span>
            <a
              href="https://github.com/ShreyashTailor/samp-xyz"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Open Source on GitHub
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
