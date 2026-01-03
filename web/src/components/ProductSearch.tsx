"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, ShoppingCart, Store, Navigation } from "lucide-react";
import { parseLocation, calculateDistance } from "@/lib/location";

export type ProductItem = {
    id: string; // price id
    product_name: string;
    price: number;
    store_name: string;
    store_location: string | null;
    distance?: number;
};

export default function ProductSearch({ initialItems }: { initialItems: ProductItem[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [items, setItems] = useState<ProductItem[]>(initialItems);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Sync state with props
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Handle Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (err) => console.error(err)
            );
        }
    }, []);

    // Calculate distance & Sort
    useEffect(() => {
        if (location) {
            const itemsWithDist = initialItems.map((item) => {
                const coords = parseLocation(item.store_location);
                if (coords) {
                    const dist = calculateDistance(
                        location.lat,
                        location.lng,
                        coords.lat,
                        coords.lng
                    );
                    return { ...item, distance: dist };
                }
                return item;
            });

            // Sort by price (primary) and distance (secondary)
            itemsWithDist.sort((a, b) => {
                if (a.price !== b.price) {
                    return a.price - b.price;
                }
                const distA = a.distance ?? Infinity;
                const distB = b.distance ?? Infinity;
                return distA - distB;
            });

            setItems(itemsWithDist);
        } else {
            // Just sort by price if location not available
            const sorted = [...initialItems].sort((a, b) => a.price - b.price);
            setItems(sorted);
        }
    }, [location, initialItems]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="pb-20">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="商品名 (例: 牛乳)"
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-full text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </form>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 py-6 space-y-4">
                {items.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">ほしい商品を探そう</p>
                        <p className="text-sm mt-2">牛乳、たまご、食パンなどを<br />検索して比較してみよう！</p>
                    </div>
                ) : (
                    items.map((item, index) => {
                        const isCheapest = index === 0;
                        return (
                            <div
                                key={item.id}
                                className={`relative bg-white p-4 rounded-xl border ${isCheapest ? "border-red-200 shadow-md ring-1 ring-red-100" : "border-gray-100 shadow-sm"
                                    }`}
                            >
                                {isCheapest && (
                                    <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <span>👑 地域最安値</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mt-1">
                                    <div>
                                        <h3 className="text-sm text-gray-500 font-medium mb-1">{item.store_name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`font-bold ${isCheapest ? "text-3xl text-red-600" : "text-xl text-gray-900"}`}>
                                                ¥{item.price}
                                            </span>
                                            <span className="text-xs text-gray-400">税込</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 mt-2 flex items-center gap-1">
                                            <Store className="w-3 h-3 text-gray-400" />
                                            {item.product_name}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        {item.distance !== undefined && (
                                            <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">
                                                <Navigation className="w-3 h-3 mr-1" />
                                                {item.distance.toFixed(1)}km
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
