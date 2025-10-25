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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Images, Upload, Plus } from "lucide-react"
import supabase from "@/utils/supabase"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { mockImages } from "@/utils/mockData"
import type { Image } from "@/components/db/schema"

export function GalleryCard() {
  const [images] = useState<Image[]>(mockImages)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState("family")
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
        })
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image smaller than 5MB",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select an image to upload",
      })
      return
    }

    try {
  setUploading(true)
  const filename = `${Date.now()}-${selectedFile.name}`
  // Prefix filepath with the current user's group_id. If not available, use 'nogroup' as fallback.
  // Assumption: group_id is stored on the Supabase user metadata as user.user_metadata.group_id
  const groupId = String(user?.user_metadata?.group_id ?? 'nogroup')
  const filepath = `${groupId}/${category}/${filename}`
      
      const { error } = await supabase.storage
        .from("Images")
        .upload(filepath, selectedFile)

      if (error) {
        toast.error("Upload failed", {
          description: error.message,
        })
      } else {
        toast.success("Image uploaded successfully!", {
          description: `Your image has been added to the ${category} category`,
        })
        setSheetOpen(false)
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('picture') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            <div>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>Recent photos and memories</CardDescription>
            </div>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Image
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Upload New Image</SheetTitle>
                <SheetDescription>
                  Add a new photo to your gallery. Supported formats: JPG, PNG, GIF (max 5MB)
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Category Selection */}
                <div className="space-y-2 max-w-[200px] ml-2.5">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="memes">Memes</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div className="space-y-2 max-w-[200px] ml-2.5">
                  <Label htmlFor="picture">Select Image</Label>
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer max-w-fit"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                {/* Preview */}
                {selectedFile && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="space-y-2">
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted border">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <p className="text-sm font-medium text-center">{image.title}</p>
                    {image.category && (
                      <p className="text-xs text-muted-foreground text-center capitalize">
                        {image.category}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant="default" className="ml-15"/>
            <CarouselNext variant="default" className="mr-15" />
          </Carousel>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images yet</p>
            <p className="text-sm">Click "Add Image" to upload your first photo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
