"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export interface Point {
    id: string;
    lat: number;
    lng: number;
    label: string;
}

export interface MapProps {
    centerPoint?: Point | null;
    points: Point[];
}

const Map = ({ centerPoint, points }: MapProps) => {
    if (!centerPoint) {
        return <div>Carregando...</div>;
    }
    return (
        <MapContainer
            dragging={true}
            center={[centerPoint.lat, centerPoint.lng]} // Centraliza no primeiro ponto
            zoom={13} // Nível de zoom inicial
            style={{ height: "68vh", width: "100%" }}
        >
            {/* TileLayer fornece o fundo do mapa */}
            <TileLayer
                attribution='&copy; <a href="https://www.carto.com/">CARTO</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <Marker
                    key={centerPoint.id}
                    position={[centerPoint.lat, centerPoint.lng]}
                    icon={L.icon({
                        iconUrl: "/location-house.png",
                        iconSize: [40, 40],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    })}
                >
                    <Popup>{centerPoint.label}</Popup>
                </Marker>

            {/* Adiciona os pontos como marcadores */}
            {points?.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={L.icon({
                        iconUrl: "/location-map.png",
                        iconSize: [30, 30],
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
