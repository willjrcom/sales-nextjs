"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
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
    selectedPoints: Point[];
}

const Map = ({ centerPoint, points, selectedPoints }: MapProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null); // Ref para o container do mapa
    const mapRef = useRef<L.Map | null>(null); // Ref para a instância do mapa

    useEffect(() => {
        if (mapContainerRef.current && centerPoint && !mapRef.current) {
            // Inicializa o mapa se ainda não foi criado
            mapRef.current = L.map(mapContainerRef.current).setView(
                [centerPoint.lat, centerPoint.lng],
                13
            );

            // Adiciona o fundo do mapa
            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                {
                    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a> contributors',
                }
            ).addTo(mapRef.current);

            // Adiciona marcador do ponto central
            L.marker([centerPoint.lat, centerPoint.lng], {
                icon: L.icon({
                    iconUrl: "/location-house.png",
                    iconSize: [40, 40],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                }),
            })
                .addTo(mapRef.current)
                .bindPopup(centerPoint.label);

            // Adiciona os outros pontos como marcadores
            points.forEach((point) => {
                L.marker([point.lat, point.lng], {
                    icon: L.icon({
                        iconUrl: "/location-map.png",
                        iconSize: [30, 30],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    }),
                })
                    .addTo(mapRef.current!)
                    .bindPopup(point.label);
            });

            selectedPoints.forEach((point) => {
                L.marker([point.lat, point.lng], {
                    icon: L.icon({
                        iconUrl: "/location-map-selected.png",
                        iconSize: [30, 30],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    }),
                })
                    .addTo(mapRef.current!)
                    .bindPopup(point.label);
            });
        }

        return () => {
            // Limpa o mapa ao desmontar o componente
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [centerPoint, points]); // Reexecuta o efeito ao mudar `centerPoint` ou `points`

    if (!centerPoint) {
        return <div>Carregando...</div>;
    }

    return (
        <div
            ref={mapContainerRef}
            style={{ height: "58vh", width: "100%" }}
        />
    );
};

export default Map;
