// MessageLocation.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';

const MessageLocation = ({ location }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        if (location && mapRef.current && !map) {
            // Khởi tạo bản đồ với Leaflet
            const newMap = L.map(mapRef.current).setView([location?.latitude, location?.longitude], 15);

            // Thêm TileLayer OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(newMap);

            // Thêm marker cho vị trí
            const newMarker = L.marker([location?.latitude, location?.longitude]).addTo(newMap);

            setMap(newMap);
            setMarker(newMarker);
        }
    }, [location, map]);

    return (
        <div className="message-location">
            <div
                style={{ height: '200px', width: '100%' }}
                ref={mapRef}
            />
            <a
                href={`https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
            >
                <span>📍 Xem vị trí trên Google Maps</span>
            </a>
        </div>
    );
};

export default MessageLocation;
