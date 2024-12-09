"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface MapProps {
    points: { id: string; lat: number; lng: number; label: string }[];
}

const Map = ({ points }: MapProps) => {
    if (!points || points.length === 0) {
        return <div>Carregando...</div>;
    }
    return (
        <MapContainer
            center={[points[0].lat, points[0].lng]} // Centraliza no primeiro ponto
            zoom={13} // Nível de zoom inicial
            style={{ height: "500px", width: "100%" }}
        >
            {/* TileLayer fornece o fundo do mapa */}
            <TileLayer
                attribution='&copy; <a href="https://www.carto.com/">CARTO</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Adiciona os pontos como marcadores */}
            {points?.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={L.icon({
                        iconUrl: "/location-map.png", // Você pode personalizar o ícone
                        iconSize: [25, 25],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    })}
                >
                    <Popup>{point.label}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
