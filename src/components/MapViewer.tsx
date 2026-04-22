"use client";

import { useState } from "react";
import { MapContainer, ImageOverlay, useMapEvents, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapViewer.module.css";

// High-res Map from requested source
const IMAGE_URL = "https://interactive-game-maps.github.io/grand_theft_auto_san_andreas/full_map.webp";
const MAP_BOUNDS: L.LatLngBoundsExpression = [
  [-3000, -3000],
  [3000, 3000],
];

interface BoundingBox {
  start: L.LatLng;
  end: L.LatLng;
}

function SelectionTool({ onSelectionConfirmed }: { onSelectionConfirmed: (bounds: L.LatLngBounds) => void }) {
  const [bbox, setBbox] = useState<BoundingBox | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useMapEvents({
    mousedown(e) {
      if ((e.originalEvent as MouseEvent).button !== 0) return;
      // Disable map dragging so we can draw the rectangle
      e.target.dragging.disable();
      setIsDrawing(true);
      setBbox({ start: e.latlng, end: e.latlng });
    },
    mousemove(e) {
      if (!isDrawing || !bbox) return;
      setBbox({ ...bbox, end: e.latlng });
    },
    mouseup(e) {
      if (!isDrawing || !bbox) return;
      setIsDrawing(false);
      // Re-enable map dragging
      e.target.dragging.enable();
      setBbox({ ...bbox, end: e.latlng });
      const finalBounds = L.latLngBounds(bbox.start, e.latlng);
      onSelectionConfirmed(finalBounds);
    },
  });

  if (!bbox) return null;

  return (
    <Rectangle
      bounds={L.latLngBounds(bbox.start, bbox.end)}
      pathOptions={{ color: "#14b8a6", weight: 3, fillOpacity: 0.2 }}
    />
  );
}

interface MapViewerProps {
  onSelection: (bounds: L.LatLngBounds | null) => void;
}

export default function MapViewer({ onSelection }: MapViewerProps) {
  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        crs={L.CRS.Simple}
        center={[0, 0]}
        zoom={0}
        minZoom={-3}
        maxZoom={4}
        maxBounds={MAP_BOUNDS}
        style={{ width: "100%", height: "100%", background: "#030509" }}
        className={styles.mapElement}
        scrollWheelZoom={true}
        dragging={true}
      >
        <ImageOverlay
          url={IMAGE_URL}
          bounds={MAP_BOUNDS}
          opacity={1}
          zIndex={10}
        />
        <SelectionTool onSelectionConfirmed={onSelection} />
      </MapContainer>
      
      <div className={styles.instructionOverlay}>
        <span className={styles.pulseDot}></span>
        <span>Drag map to pan. Click and drag to select an area.</span>
      </div>
    </div>
  );
}
