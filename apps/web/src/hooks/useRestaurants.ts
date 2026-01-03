import { useQuery } from '@tanstack/react-query';
import type { Restaurant } from '@repo/shared';

// Use environment variable or default to localhost:3000
// Use proxy in dev (vite.config.ts handles /api -> http://localhost:3000)
const API_URL = '/api';

export function useRestaurants(lat: number, lng: number, radius: number = 5000) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['restaurants', lat, lng, radius],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/restaurants?lat=${lat}&lng=${lng}&radius=${radius}`);
            if (!response.ok) {
                throw new Error('Failed to fetch restaurants');
            }
            return response.json() as Promise<Restaurant[]>;
        },
    });

    return { restaurants: data || [], loading: isLoading, error: error ? error.message : null };
}
