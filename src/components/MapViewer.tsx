"use client";

import { useState } from "react";
import { MapContainer, ImageOverlay, useMapEvents, Rectangle, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapViewer.module.css";

// High-res Map from requested source
const IMAGE_URL = "https://interactive-game-maps.github.io/grand_theft_auto_san_andreas/full_map.webp";
const MAP_BOUNDS: L.LatLngBoundsExpression = [
  [-3000, -3000],
  [3000, 3000],
];

function SelectionTool({ 
  onSelectionConfirmed, 
  initialBounds 
}: { 
  onSelectionConfirmed: (bounds: L.LatLngBounds | null) => void,
  initialBounds: L.LatLngBounds | null
}) {
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
        const newBounds = L.latLngBounds(dragStart, e.latlng);
        setBbox(newBounds);
      } else if (dragMode === 'move' && dragStart) {
        const latDiff = e.latlng.lat - dragStart.lat;
        const lngDiff = e.latlng.lng - dragStart.lng;
        if (bbox) {
          const newBounds = L.latLngBounds(
            [bbox.getSouth() + latDiff, bbox.getWest() + lngDiff],
            [bbox.getNorth() + latDiff, bbox.getEast() + lngDiff]
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
}

export default function MapViewer({ onSelection, currentSelection }: MapViewerProps) {
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
        <SelectionTool 
          onSelectionConfirmed={onSelection} 
          initialBounds={currentSelection}
        />
      </MapContainer>
      
      <div className={styles.instructionOverlay}>
        <span className={styles.pulseDot}></span>
        <span>Drag map to pan. Click and drag to select an area.</span>
      </div>
    </div>
  );
}
