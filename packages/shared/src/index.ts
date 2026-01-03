export interface Restaurant {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    rating: number;
    address: string;
    imageUrl?: string;
}

export interface SearchQuery {
    latitude: number;
    longitude: number;
    radiusInMeters: number;
}
