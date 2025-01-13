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
    const markersRef = useRef<L.LayerGroup>(L.layerGroup()); // Ref para agrupar marcadores (inicia como uma instância de LayerGroup)

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Inicializa o mapa apenas uma vez
            mapRef.current = L.map(mapContainerRef.current).setView(
                [centerPoint?.lat || 0, centerPoint?.lng || 0],
                13
            );

            // Adiciona o fundo do mapa
            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                {
                    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a> contributors',
                }
            ).addTo(mapRef.current);

            // Adiciona o grupo de marcadores ao mapa
            markersRef.current.addTo(mapRef.current);
        }

        return () => {
            // Remove o mapa ao desmontar o componente
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Este efeito roda apenas uma vez

    useEffect(() => {
        if (mapRef.current && centerPoint) {
            // Centraliza o mapa no ponto central apenas quando `centerPoint` muda
            mapRef.current.setView([centerPoint.lat, centerPoint.lng], 13);
        }
    }, [centerPoint]);

    useEffect(() => {
        if (markersRef.current) {
            // Remove marcadores anteriores
            markersRef.current.clearLayers();

            // Adiciona marcador do ponto central
            if (centerPoint) {
                L.marker([centerPoint.lat, centerPoint.lng], {
                    icon: L.icon({
                        iconUrl: "/location-house.png",
                        iconSize: [40, 40],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    }),
                })
                    .addTo(markersRef.current)
                    .bindPopup(centerPoint.label);
            }

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
                    .addTo(markersRef.current)
                    .bindPopup(point.label);
            });

            // Adiciona os pontos selecionados
            selectedPoints?.forEach((point) => {
                L.marker([point.lat, point.lng], {
                    icon: L.icon({
                        iconUrl: "/location-map-selected.png",
                        iconSize: [30, 30],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    }),
                })
                    .addTo(markersRef.current)
                    .bindPopup(point.label);
            });
        }
    }, [points, selectedPoints, centerPoint]); // Reexecuta ao mudar `points`, `selectedPoints` ou `centerPoint`

    if (!centerPoint) {
        return <div>Carregando ponto central...</div>;
    }

    return (
        <div
            ref={mapContainerRef}
            style={{ height: "58vh", width: "100%" }}
        />
    );
};

export default Map;
