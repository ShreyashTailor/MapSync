"use client";

import { useState } from "react";
import { MapContainer, ImageOverlay, useMapEvents, Rectangle, CircleMarker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapViewer.module.css";

// Map configurations
const MAPS = {
  sa: {
    url: "https://interactive-game-maps.github.io/grand_theft_auto_san_andreas/full_map.webp",
    bounds: [[-3000, -3000], [3000, 3000]] as L.LatLngBoundsExpression,
    minZoom: -3,
    maxZoom: 4,
    center: [0, 0] as L.LatLngExpression
  },
  v: {
    // Local high-res satellite map for GTA V (downloaded to public/)
    url: "/gtav_map.jpg",
    bounds: [[-4000, -4000], [4000, 4000]] as L.LatLngBoundsExpression,
    minZoom: -2,
    maxZoom: 4,
    center: [0, 0] as L.LatLngExpression
  }
};

interface SelectionToolProps {
  onSelectionConfirmed: (bounds: L.LatLngBounds | null) => void;
  initialBounds: L.LatLngBounds | null;
}

function SelectionTool({ 
  onSelectionConfirmed, 
  initialBounds 
}: SelectionToolProps) {
  const [bbox, setBbox] = useState<L.LatLngBounds | null>(initialBounds);
  const [dragMode, setDragMode] = useState<'create' | 'move' | 'resize' | null>(null);
  const [dragStart, setDragStart] = useState<L.LatLng | null>(null);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);

  const map = useMapEvents({
    mousedown(e) {
      if ((e.originalEvent as MouseEvent).button !== 0) return;
      
      // If clicking outside existing box, start 'create' mode
      if (!bbox || !bbox.contains(e.latlng)) {
        setDragMode('create');
        setDragStart(e.latlng);
        setBbox(L.latLngBounds(e.latlng, e.latlng));
        map.dragging.disable();
      }
    },
    mousemove(e) {
      if (!dragMode) return;

      if (dragMode === 'create' && dragStart) {
        setBbox(L.latLngBounds(dragStart, e.latlng));
      } else if (dragMode === 'move' && dragStart) {
        const latDiff = e.latlng.lat - dragStart.lat;
        const lngDiff = e.latlng.lng - dragStart.lng;
        if (bbox) {
          const sw = bbox.getSouthWest();
          const ne = bbox.getNorthEast();
          const newBounds = L.latLngBounds(
            [sw.lat + latDiff, sw.lng + lngDiff],
            [ne.lat + latDiff, ne.lng + lngDiff]
          );
          setBbox(newBounds);
          setDragStart(e.latlng);
        }
      } else if (dragMode === 'resize' && resizeCorner && bbox) {
        let sw = bbox.getSouthWest();
        let ne = bbox.getNorthEast();
        
        if (resizeCorner === 'nw') { ne = L.latLng(e.latlng.lat, ne.lng); sw = L.latLng(sw.lat, e.latlng.lng); }
        if (resizeCorner === 'ne') { ne = e.latlng; }
        if (resizeCorner === 'sw') { sw = e.latlng; }
        if (resizeCorner === 'se') { sw = L.latLng(e.latlng.lat, sw.lng); ne = L.latLng(ne.lat, e.latlng.lng); }
        
        setBbox(L.latLngBounds(sw, ne));
      }
    },
    mouseup() {
      if (dragMode) {
        onSelectionConfirmed(bbox);
        setDragMode(null);
        setDragStart(null);
        setResizeCorner(null);
        map.dragging.enable();
      }
    },
  });

  if (!bbox) return null;

  const corners = {
    nw: [bbox.getNorth(), bbox.getWest()],
    ne: [bbox.getNorth(), bbox.getEast()],
    sw: [bbox.getSouth(), bbox.getWest()],
    se: [bbox.getSouth(), bbox.getEast()],
  };

  return (
    <>
      <Rectangle
        bounds={bbox}
        pathOptions={{ color: "#14b8a6", weight: 2, fillOpacity: 0.15, dashArray: '5, 5' }}
        eventHandlers={{
          mousedown: (e) => {
            if (e.originalEvent) e.originalEvent.stopPropagation();
            setDragMode('move');
            setDragStart(e.latlng);
            map.dragging.disable();
          }
        }}
      />
      {Object.entries(corners).map(([key, pos]) => (
        <CircleMarker
          key={key}
          center={pos as L.LatLngExpression}
          radius={6}
          pathOptions={{ color: "#fff", fillColor: "#14b8a6", fillOpacity: 1, weight: 2 }}
          eventHandlers={{
            mousedown: (e) => {
              if (e.originalEvent) e.originalEvent.stopPropagation();
              setDragMode('resize');
              setResizeCorner(key);
              map.dragging.disable();
            }
          }}
        />
      ))}
    </>
  );
}

interface MapViewerProps {
  onSelection: (bounds: L.LatLngBounds | null) => void;
  currentSelection: L.LatLngBounds | null;
  mapType: 'sa' | 'v';
}

export default function MapViewer({ onSelection, currentSelection, mapType }: MapViewerProps) {
  const config = MAPS[mapType];
  const [mousePos, setMousePos] = useState<L.LatLng | null>(null);

  // Helper to handle coordinate changes from manual input
  const handleManualInput = (key: string, value: string) => {
    if (!currentSelection) return;
    const val = parseFloat(value);
    if (isNaN(val)) return;
  };

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        key={mapType} // Force re-mount on map switch
        crs={L.CRS.Simple}
        center={[0, 0]}
        zoom={mapType === 'sa' ? 0 : -1}
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        style={{ width: "100%", height: "100%", background: "#030509" }}
        className={styles.mapElement}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false}
        zoomSnap={0}
      >
        <ZoomControl position="bottomleft" />
        <CoordinateTracker onMouseMove={setMousePos} />
        
        <ImageOverlay
          url={config.url}
          bounds={config.bounds}
          opacity={1}
          zIndex={10}
        />

        {/* Origin Crosshair for calibration */}
        <div className={styles.originMarker}></div>

        <SelectionTool 
          onSelectionConfirmed={onSelection} 
          initialBounds={currentSelection}
        />
      </MapContainer>
      
      <div className={styles.instructionOverlay}>
        <span className={styles.pulseDot}></span>
        <span>Drag map to pan. Click and drag to select an area.</span>
      </div>

      <div className={styles.coordDisplay}>
        {mousePos ? `X: ${mousePos.lng.toFixed(1)} Y: ${mousePos.lat.toFixed(1)}` : 'Hover map for coords'}
      </div>
    </div>
  );
}

function CoordinateTracker({ onMouseMove }: { onMouseMove: (pos: L.LatLng) => void }) {
  useMapEvents({
    mousemove: (e) => {
      onMouseMove(e.latlng);
    }
  });
  return null;
}
