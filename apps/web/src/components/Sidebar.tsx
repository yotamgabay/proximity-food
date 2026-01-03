import type { Restaurant } from "@repo/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
    restaurants: Restaurant[] | undefined;
    isLoading: boolean;
}

export function Sidebar({ restaurants, isLoading }: SidebarProps) {
    return (
        <div className="h-full w-80 bg-background border-r flex flex-col absolute left-0 top-0 z-10 shadow-xl transition-transform">
            <div className="p-4 border-b bg-card">
                <h1 className="text-xl font-bold">Proximity Food</h1>
                <p className="text-sm text-muted-foreground">Find good food near you</p>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground animate-pulse">Finding hidden gems...</p>
                    ) : restaurants?.length === 0 ? (
                        <p className="text-center text-muted-foreground">No restaurants found nearby. Try moving the pin!</p>
                    ) : (
                        restaurants?.map((restaurant) => (
                            <Card key={restaurant.id} className="hover:bg-accent cursor-pointer transition-colors">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-semibold">{restaurant.name}</CardTitle>
                                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {restaurant.rating} ⭐
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
