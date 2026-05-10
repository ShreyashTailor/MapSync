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
  const [heightPreset, setHeightPreset] = useState<'ground' | 'air' | 'full'>('ground');

  const minX = selectedBounds ? Math.min(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const maxX = selectedBounds ? Math.max(selectedBounds.getWest(), selectedBounds.getEast()).toFixed(4) : "0.0000";
  const minY = selectedBounds ? Math.min(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";
  const maxY = selectedBounds ? Math.max(selectedBounds.getSouth(), selectedBounds.getNorth()).toFixed(4) : "0.0000";

  // Updated Z calculation based on presets - more inclusive to prevent "kicks"
  const getZDefaults = () => {
    if (mapType === 'sa') {
      if (heightPreset === 'ground') return { min: "-100.0000", max: "1000.0000" }; // Ground to low air
      if (heightPreset === 'air') return { min: "800.0000", max: "4000.0000" };    // Mid air to sky
      return { min: "-1000.0000", max: "4000.0000" };                             // Absolute full world
    } else {
      if (heightPreset === 'ground') return { min: "-500.0000", max: "1500.0000" };
      if (heightPreset === 'air') return { min: "1200.0000", max: "8000.0000" };
      return { min: "-2000.0000", max: "8000.0000" };
    }
  };

  const zDefaults = getZDefaults();

  const [manualX, setManualX] = useState<string | null>(null);
  const [manualY, setManualY] = useState<string | null>(null);
  const [manualZ, setManualZ] = useState<string | null>(null);
  const [manualMaxX, setManualMaxX] = useState<string | null>(null);
  const [manualMaxY, setManualMaxY] = useState<string | null>(null);
  const [manualMaxZ, setManualMaxZ] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'rect' | 'area'>('area');

  const displayMinX = manualX ?? minX;
  const displayMinY = manualY ?? minY;
  const displayMinZ = manualZ ?? zDefaults.min;
  const displayMaxX = manualMaxX ?? maxX;
  const displayMaxY = manualMaxY ?? maxY;
  const displayMaxZ = manualMaxZ ?? zDefaults.max;

  const handleCopy = () => {
    if (!selectedBounds && !manualX) {
      alert("Please select a zone on the map first.");
      return;
    }
    
    let output = "";
    if (outputFormat === 'rect') {
      output = `${displayMinX}, ${displayMinY}, ${displayMaxX}, ${displayMaxY}`;
    } else {
      output = `${displayMinX}, ${displayMinY}, ${displayMinZ}, ${displayMaxX}, ${displayMaxY}, ${displayMaxZ}`;
    }
    
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getCodeSnippet = () => {
    if (outputFormat === 'rect') {
      return `IsPlayerInRectangle(playerid, ${displayMinX}, ${displayMinY}, ${displayMaxX}, ${displayMaxY})`;
    }
    return `IsPlayerInDynamicArea(areaid, ${displayMinX}, ${displayMinY}, ${displayMinZ}, ${displayMaxX}, ${displayMaxY}, ${displayMaxZ})`;
  };

  return (
    <main className={styles.container}>

      <header className={styles.header}>
        <div className={styles.subtitle}>zone selector tool</div>
        <h1 className={styles.title}>XYZ CALCULATOR</h1>

        <div className={styles.mapSwitcher}>
          <button
            className={`${styles.switchBtn} ${mapType === 'sa' ? styles.activeSwitch : ''}`}
            onClick={() => { setMapType('sa'); setSelectedBounds(null); setManualX(null); setManualY(null); setManualMaxX(null); setManualMaxY(null); }}
          >
            SA-MP (GTA SA)
          </button>
          <button
            className={`${styles.switchBtn} ${mapType === 'v' ? styles.activeSwitch : ''}`}
            onClick={() => { setMapType('v'); setSelectedBounds(null); setManualX(null); setManualY(null); setManualMaxX(null); setManualMaxY(null); }}
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
          onSelection={(b) => { setSelectedBounds(b); setManualX(null); setManualY(null); setManualMaxX(null); setManualMaxY(null); }}
          currentSelection={selectedBounds}
          mapType={mapType}
        />
      </div>

      <div className={styles.controlsPanel}>
        <div className={styles.presetsRow}>
          <span className={styles.presetLabel}>HEIGHT PRESET:</span>
          <div className={styles.presetGroup}>
            <button 
              className={`${styles.presetBtn} ${heightPreset === 'ground' ? styles.activePreset : ''}`}
              onClick={() => { setHeightPreset('ground'); setManualZ(null); setManualMaxZ(null); }}
            >
              GROUND & LOW AIR
            </button>
            <button 
              className={`${styles.presetBtn} ${heightPreset === 'air' ? styles.activePreset : ''}`}
              onClick={() => { setHeightPreset('air'); setManualZ(null); setManualMaxZ(null); }}
            >
              ALL AIR & SKY
            </button>
            <button 
              className={`${styles.presetBtn} ${heightPreset === 'full' ? styles.activePreset : ''}`}
              onClick={() => { setHeightPreset('full'); setManualZ(null); setManualMaxZ(null); }}
            >
              FULL VERTICAL (SAFE)
            </button>
          </div>
        </div>
        
        <div className={styles.mainControls}>

        <div className={styles.dataGroup}>
          <div className={styles.groupLabel}>Minimum Zone Boundary (South-West)</div>
          <div className={styles.inputsRow}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN X</span>
              <input value={displayMinX} onChange={(e) => setManualX(e.target.value)} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN Y</span>
              <input value={displayMinY} onChange={(e) => setManualY(e.target.value)} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MIN Z</span>
              <input value={displayMinZ} onChange={(e) => setManualZ(e.target.value)} className={styles.inputField} />
            </div>
          </div>
        </div>

        <div className={styles.dataGroup}>
          <div className={styles.groupLabel}>Maximum Zone Boundary (North-East)</div>
          <div className={styles.inputsRow}>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX X</span>
              <input value={displayMaxX} onChange={(e) => setManualMaxX(e.target.value)} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX Y</span>
              <input value={displayMaxY} onChange={(e) => setManualMaxY(e.target.value)} className={styles.inputField} />
            </div>
            <div className={styles.inputBox}>
              <span className={styles.inputLabel}>MAX Z</span>
              <input value={displayMaxZ} onChange={(e) => setManualMaxZ(e.target.value)} className={styles.inputField} />
            </div>
          </div>
        </div>
        </div>

        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <div className={styles.formatSwitcher}>
              <button 
                className={`${styles.formatBtn} ${outputFormat === 'rect' ? styles.activeFormat : ''}`}
                onClick={() => setOutputFormat('rect')}
              >
                2D Rectangle
              </button>
              <button 
                className={`${styles.formatBtn} ${outputFormat === 'area' ? styles.activeFormat : ''}`}
                onClick={() => setOutputFormat('area')}
              >
                3D Dynamic Area
              </button>
            </div>
            <div className={styles.previewTitle}>Code Preview (PAWN)</div>
          </div>
          <div className={styles.codeSnippet}>
            <code>{getCodeSnippet()}</code>
          </div>
        </div>
      </div>

      <footer className={styles.copyWrapper}>
        <button className={styles.copyButton} onClick={handleCopy}>
          {isCopied ? <Check size={24} /> : <Copy size={24} />}
          <span>{isCopied ? "COPIED TO CLIPBOARD!" : "COPY COORDINATES"}</span>
        </button>
      </footer>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <img
            src="https://www.gta-multiplayer.cz/images/avatars/MP-6.png"
            alt="Avatar"
            className={styles.footerAvatar}
          />
          <div className={styles.footerText}>
            <div className={styles.footerCredit}>Created by <strong>Shreyash</strong></div>
            <a
              href="https://github.com/shreyash-07"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              View on GitHub (Open Sourced)
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
