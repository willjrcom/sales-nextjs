"use client";

import Map from "@/app/components/map/map";

const points = [
    { id: "1", lat: -23.55052, lng: -46.633308, label: "São Paulo" },
    { id: "2", lat: -22.9035, lng: -43.2096, label: "Rio de Janeiro" },
    { id: "3", lat: -15.7942, lng: -47.8822, label: "Brasília" },
];

const MapPage = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Mapa com Pontos</h1>
            <Map points={points} />
        </div>
    );
};

export default MapPage;
