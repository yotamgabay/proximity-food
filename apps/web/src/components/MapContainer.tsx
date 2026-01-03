import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, useMap } from "@/components/ui/map";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import type { MapMouseEvent } from "maplibre-gl";

function MapEvents({ onMove }: { onMove: (lat: number, lng: number, zoom: number) => void }) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const onMoveEnd = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            onMove(center.lat, center.lng, zoom);
        };

        map.on('moveend', onMoveEnd);
        return () => {
            map.off('moveend', onMoveEnd);
        };
    }, [map, onMove]);

    return null;
}

function MapClickHandler({ onClick, isPinMode }: { onClick: (lat: number, lng: number) => void; isPinMode: boolean }) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const onClickHandler = (e: MapMouseEvent) => {
            if (isPinMode) {
                onClick(e.lngLat.lat, e.lngLat.lng);
            }
        };

        map.on('click', onClickHandler);
        return () => {
            map.off('click', onClickHandler);
        };
    }, [map, onClick, isPinMode]);

    return null;
}

export function MapContainer() {
    const [viewState, setViewState] = useState({
        longitude: -74.006,
        latitude: 40.7128,
        zoom: 12,
    });
    const [anchorPoint, setAnchorPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isPinMode, setIsPinMode] = useState(false);
    const [radius, setRadius] = useState(5000);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setViewState(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    zoom: 14,
                }));
                setUserLocation({ lat: latitude, lng: longitude });
                setAnchorPoint({ lat: latitude, lng: longitude });
            });
        }
    }, []);

    // Fetch restaurants based on anchor point or view center if no anchor
    const searchCenter = anchorPoint || { lat: viewState.latitude, lng: viewState.longitude };
    const { restaurants, loading: isLoading } = useRestaurants(searchCenter.lat, searchCenter.lng, radius);

    return (
        <div className="h-full w-full relative group">
            <Sidebar restaurants={restaurants} isLoading={isLoading} />
            <Navbar
                isPinMode={isPinMode}
                onPinModeToggle={() => setIsPinMode(prev => !prev)}
                radius={radius}
                onRadiusChange={setRadius}
            />
            <div className={`h-full w-full pl-0 transition-all duration-300 ${isPinMode ? 'cursor-crosshair' : ''}`}>
                <Map
                    center={[viewState.longitude, viewState.latitude]}
                    zoom={viewState.zoom}
                >
                    <MapControls />
                    <MapEvents onMove={(lat, lng, zoom) => setViewState({ latitude: lat, longitude: lng, zoom })} />
                    <MapClickHandler
                        onClick={(lat, lng) => {
                            setAnchorPoint({ lat, lng });
                            setIsPinMode(false);
                        }}
                        isPinMode={isPinMode}
                    />

                    {/* Anchor Point Marker (Pin) */}
                    {anchorPoint && (
                        <MapMarker
                            latitude={anchorPoint.lat}
                            longitude={anchorPoint.lng}
                        >
                            <MarkerContent>
                                <div className="text-4xl filter drop-shadow-md cursor-pointer hover:scale-110 transition-transform relative z-[50]" title="Search Location">📍</div>
                            </MarkerContent>
                        </MapMarker>
                    )}

                    {/* User Location Marker (Me) */}
                    {userLocation && (
                        <MapMarker
                            latitude={userLocation.lat}
                            longitude={userLocation.lng}
                        >
                            <MarkerContent>
                                <div className="relative flex h-4 w-4 z-[51]">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg" title="My Location"></span>
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    )}

                    {/* Restaurant Markers */}
                    {restaurants.map((restaurant) => (
                        <MapMarker
                            key={restaurant.id}
                            longitude={restaurant.longitude}
                            latitude={restaurant.latitude}
                        >
                            <MarkerContent>
                                <div className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform flex items-center justify-center w-10 h-10 text-xl">
                                    🍔
                                </div>
                            </MarkerContent>
                            <MarkerPopup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
                                    <div className="mt-2 text-xs flex items-center gap-2">
                                        <span className="font-semibold text-yellow-600">⭐ {restaurant.rating}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="truncate">{restaurant.address}</span>
                                    </div>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    ))}
                </Map>
            </div>
        </div>
    );
}
