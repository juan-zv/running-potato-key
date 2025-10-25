import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Images } from "lucide-react"

const mockImages = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&h=300&fit=crop",
    title: "Mountain View",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    title: "Nature Scene",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
    title: "Sunset",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    title: "Forest Path",
  },
]

export function GalleryCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          <div>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>Recent photos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {mockImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="space-y-2">
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <p className="text-sm font-medium text-center">{image.title}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  )
}
