import { Box, Button, Modal, TextField } from "@mui/material";
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

const DEFAULT_COORDS = [10.762622, 106.660172]; // Ho Chi Minh City

function ChangeMapView({ coords }) {
    const map = useMap();
    useEffect(() => {
        map.setView(coords, 15);
    }, [coords]);
    return null;
}

export default function ModalMap({ open, onClose, onSendLocation }) {
    const [position, setPosition] = useState(DEFAULT_COORDS);
    const [searchInput, setSearchInput] = useState("");
    const provider = new OpenStreetMapProvider();

    const handleSearch = async () => {
        const results = await provider.search({ query: searchInput });
        if (results && results.length > 0) {
            const { x, y } = results[0];
            setPosition([y, x]);
        }
    };

    const handleLocateMe = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                setPosition(coords);
            },
            (err) => {
                console.error("Không thể lấy vị trí hiện tại:", err);
            }
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ width: 600, height: 600, backgroundColor: '#fff', margin: 'auto', mt: 5, borderRadius: 2, p: 2 }}>
                <TextField
                    fullWidth
                    label="Tìm địa điểm"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ mb: 2 }}
                    size="small"
                />
                <Button variant="outlined" onClick={handleLocateMe} sx={{ mb: 2 }}>📍 Định vị vị trí của tôi</Button>
                <MapContainer center={position} zoom={15} style={{ height: "70%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ChangeMapView coords={position} />
                    <Marker position={position} />
                </MapContainer>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                        onSendLocation(position);
                        onClose();
                    }}
                >
                    Gửi vị trí này
                </Button>
            </Box>
        </Modal>
    );
}
