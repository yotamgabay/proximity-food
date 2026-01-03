import { Controller, Get, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, SearchQuery } from '@repo/shared';

@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @Get()
    async findAll(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('radius') radius: string,
    ): Promise<Restaurant[]> {
        const query: SearchQuery = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            radiusInMeters: parseFloat(radius) || 1000,
        };
        return this.restaurantsService.findAll(query);
    }
}
