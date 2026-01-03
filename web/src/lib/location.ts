export function parseLocation(locationStr: string | null): { lat: number; lng: number } | null {
    if (!locationStr) return null;

    // Check for Hex EWKB format (starts with 01 for little endian)
    if (locationStr.match(/^[0-9A-Fa-f]+$/) && locationStr.length > 20) {
        try {
            // Basic EWKB Parser for Point (Little Endian)
            // Header: 1 byte (endian) + 4 bytes (type) + 4 bytes (SRID) = 9 bytes (18 hex chars)
            // Coords: 8 bytes (X) + 8 bytes (Y) = 16 bytes (32 hex chars) total

            // We need to parse the hex into bytes
            const bytes = new Uint8Array(locationStr.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)));
            const view = new DataView(bytes.buffer);

            const endian = view.getUint8(0); // 1 = Little Endian
            const isLittleEndian = endian === 1;

            const type = view.getUint32(1, isLittleEndian);
            // PostGIS Point type often has SRID flag (0x20000000)

            // If SRID present (typical in PostGIS), offset is 9. If not, offset is 5.
            const hasSrid = (type & 0x20000000) !== 0;

            let offset = 5;
            if (hasSrid) {
                offset += 4; // Skip SRID
            }

            const lng = view.getFloat64(offset, isLittleEndian);
            const lat = view.getFloat64(offset + 8, isLittleEndian);

            return { lat, lng };
        } catch (e) {
            console.error("Failed to parse location hex:", e);
            return null;
        }
    }

    // Fallback: Parse WKT "POINT(lng lat)"
    const match = locationStr.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/i);
    if (match) {
        return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2]),
        };
    }
    return null;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
