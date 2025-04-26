import { Box } from "@mui/material";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

// Fix leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// Hàm thay đổi view bản đồ
function ChangeMapView({ coords, zoomLevel }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(coords, zoomLevel);
        }
    }, [coords, zoomLevel, map]); // Ensure map is available before setting view

    return null;
}

export default function MapView({ selectedArea }) {
    const [position, setPosition] = useState([10.762622, 106.660172]); // Default: Ho Chi Minh City
    const [zoom, setZoom] = useState(6); // Default zoom for Vietnam

    useEffect(() => {
        if (selectedArea) {
            // Tự động điều chỉnh zoom và vị trí khi có selectedArea
            const { coords, zoomLevel } = selectedArea;
            setPosition(coords);
            setZoom(zoomLevel);
        }
    }, [selectedArea]);

    return (
        <Box sx={{ width: "100%", height: "100%", backgroundColor: '#fff', p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1 }}>
                <MapContainer center={position} zoom={zoom} style={{ height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ChangeMapView coords={position} zoomLevel={zoom} />
                    <Marker position={position} />
                </MapContainer>
            </Box>
        </Box>
    );
}