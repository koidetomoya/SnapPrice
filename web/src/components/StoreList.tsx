"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

type Store = {
    id: string;
    name: string;
    chain_name: string | null;
    address: string | null;
    location: string | null; // Expecting WKT format e.g., "POINT(135.7 35.0)"
};

type StoreWithDistance = Store & {
    distance?: number; // in km
};

export default function StoreList({ initialStores }: { initialStores: Store[] }) {
    const [stores, setStores] = useState<StoreWithDistance[]>(initialStores);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (err) => {
                console.error("Error getting location:", err);
                setError("位置情報の取得に失敗しました");
            }
        );
    }, []);

    useEffect(() => {
        if (location) {
            const storesWithDist: StoreWithDistance[] = initialStores.map((store) => {
                const coords = parseLocation(store.location);
                if (coords) {
                    const dist = calculateDistance(
                        location.lat,
                        location.lng,
                        coords.lat,
                        coords.lng
                    );
                    return { ...store, distance: dist };
                }
                return { ...store, distance: undefined };
            });

            // Sort by distance (nearest first)
            storesWithDist.sort((a, b) => {
                const distA = a.distance ?? Infinity;
                const distB = b.distance ?? Infinity;
                return distA - distB;
            });

            setStores(storesWithDist);
        } else {
            setStores(initialStores);
        }
    }, [location, initialStores]);

    return (
        <div className="space-y-4">
            {location && (
                <div className="text-sm text-gray-500 mb-4 text-center">
                    現在地から近い順に表示しています
                </div>
            )}
            {stores.length === 0 ? (
                <p className="text-center text-gray-500">
                    店舗情報が見つかりません。データベースを確認してください。
                </p>
            ) : (
                stores.map((store) => (
                    <div
                        key={store.id}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start"
                    >
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">{store.name}</h2>
                            <div className="mt-1 text-sm text-gray-500 flex flex-col gap-1">
                                {store.chain_name && <span>{store.chain_name}</span>}
                                {store.address && <span>{store.address}</span>}
                            </div>
                        </div>
                        {store.distance !== undefined && (
                            <div className="flex flex-col items-end text-blue-600 min-w-[80px]">
                                <MapPin className="w-5 h-5 mb-1" />
                                <span className="text-sm font-bold">
                                    {store.distance.toFixed(1)}km
                                </span>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

// Helpers

function parseLocation(locationStr: string | null): { lat: number; lng: number } | null {
    if (!locationStr) return null;
    // Parse WKT "POINT(lng lat)"
    const match = locationStr.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
    if (match) {
        return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2]),
        };
    }
    return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}
