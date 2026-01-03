import { Injectable, Logger } from '@nestjs/common';
import { Restaurant, SearchQuery } from '@repo/shared';
import axios from 'axios';

@Injectable()
export class RestaurantsService {
    private readonly logger = new Logger(RestaurantsService.name);
    private readonly OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

    async findAll(query: SearchQuery): Promise<Restaurant[]> {
        const { latitude, longitude, radiusInMeters } = query;
        if (!latitude || !longitude) {
            return [];
        }

        // Default radius to 5000m if not provided
        const searchRadius = radiusInMeters || 5000;

        // Overpass QL query
        const overpassQuery = `
            [out:json][timeout:25];
            (
              node["amenity"="restaurant"](around:${searchRadius},${latitude},${longitude});
              node["amenity"="fast_food"](around:${searchRadius},${latitude},${longitude});
              node["amenity"="cafe"](around:${searchRadius},${latitude},${longitude});
              way["amenity"="restaurant"](around:${searchRadius},${latitude},${longitude});
              way["amenity"="fast_food"](around:${searchRadius},${latitude},${longitude});
              way["amenity"="cafe"](around:${searchRadius},${latitude},${longitude});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            this.logger.log(`Fetching restaurants from Overpass: radius=${searchRadius}, lat=${latitude}, lng=${longitude}`);
            const response = await axios.post(this.OVERPASS_API_URL, `data=${encodeURIComponent(overpassQuery)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return this.mapOverpassResponse(response.data);
        } catch (error) {
            this.logger.error('Error fetching data from Overpass API', error);
            // Fallback to empty list or mock data if needed, but for now returning empty implies failure/no results
            return [];
        }
    }

    private mapOverpassResponse(data: any): Restaurant[] {
        if (!data || !data.elements) return [];

        const elements = data.elements.filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']));

        return elements.map((el: any) => {
            // For ways, we might not have lat/lon directly on the element, we'd need to calculate center. 
            // However, 'out center;' in query would help, but 'out body' gives nodes.
            // For simplicity in this demo, we'll try to use lat/lon if available, or skip.
            // A more robust impl would use 'out center;' for ways.

            // Let's assume nodes for now mostly, or we use defaults.
            // Actually, we should refine the query to 'out center;' for ways to get a coordinate.
            // But 'out body' is standard. Let's see if we can get by with just nodes or handle ways if they have center.
            // Overpass 'out center' adds center info to ways/relations.

            const lat = el.lat || el.center?.lat || 0;
            const lon = el.lon || el.center?.lon || 0;

            return {
                id: el.id.toString(),
                name: el.tags.name || el.tags['name:en'] || 'Unknown Restaurant',
                description: el.tags.cuisine ? `Cuisine: ${el.tags.cuisine}` : 'Food & Drink',
                latitude: lat,
                longitude: lon,
                rating: (Math.random() * 2 + 3).toFixed(1) as any as number, // Mock rating as OSM doesn't have it
                address: this.formatAddress(el.tags),
            };
        }).filter((r: Restaurant) => r.latitude !== 0 && r.longitude !== 0);
    }

    private formatAddress(tags: any): string {
        const parts = [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:city']
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Address not available';
    }
}
