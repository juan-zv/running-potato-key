import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Images } from "lucide-react"
import supabase  from "@/utils/supabase"


interface UploadSuccess {
  [key: string]: any
}

interface UploadError {
  message?: string
  status?: string | number
  [key: string]: any
}

async function uploadFile(
  file: File | Blob | string,
  category: string, 
  filename: string
): Promise<void> {
  const filepath: string = `${category}/${filename}` 
  const { data, error }: { data: UploadSuccess | null; error: UploadError | null } = await supabase.storage.from("Images").upload(filepath, file)
  if (error) {

  } else {

  }
}

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
          <div>
            <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">New Image</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="category">Category</Label>
              <select
              id="category"
              defaultValue="family"
              className="col-span-2 h-8 rounded border border-input bg-transparent px-2 text-sm"
              >
              <option value="family">Family</option>
              <option value="memes">Memes</option>
              <option
                value="create"
                onClick={(e) => {
                  e.preventDefault()
                  const name = prompt("New category name:")
                  if (!name) return
                  const select = document.getElementById("category") as HTMLSelectElement | null
                  if (select) {
                    const val = name.toLowerCase().replace(/\s+/g, "-")
                    const opt = document.createElement("option")
                    opt.value = val
                    opt.text = name
                    opt.selected = true
                    select.add(opt)
                  }
                }}
              >
                + Create new category
              </option>
              </select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="picture">Picture</Label>
              <Input id="picture" type="file" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
