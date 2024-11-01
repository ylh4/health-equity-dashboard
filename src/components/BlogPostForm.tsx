'use client'

import { useState } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image'

interface BlogPost {
  id: number
  title: string
  content: string
  images: string[]
}

interface BlogPostFormProps {
  post?: BlogPost
  onSubmit: (post: BlogPost | Omit<BlogPost, 'id'>) => void
  onCancel: () => void
}

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_preset'
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export default function BlogPostForm({ post, onSubmit, onCancel }: BlogPostFormProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [images, setImages] = useState<string[]>(post?.images || [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const processedContent = content.replace(/\[Image\]/g, (_, index) => {
      if (images[index]) {
        return `![Image]${images[index]}`
      }
      return ''
    })

    const formattedPost = {
      title,
      content: processedContent,
      images: images.filter(Boolean) // Remove any null/undefined values
    }

    if (post?.id) {
      onSubmit({ ...post, ...formattedPost })
    } else {
      onSubmit(formattedPost)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload only image files')
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      if (!CLOUD_NAME) {
        throw new Error('Cloudinary cloud name is not configured')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }

      setImages(prev => [...prev, data.secure_url])
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter report title"
        required
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter report content"
        required
        rows={6}
      />
      
      <div className="space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isUploading}>
              <ImageIcon className="h-4 w-4 mr-2" />
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Add Image'
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            {uploadError && (
              <div className="text-red-500 text-sm mb-2">
                {uploadError}
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <div className="text-sm text-gray-500">
              Maximum file size: 5MB
            </div>
          </DialogContent>
        </Dialog>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group aspect-square">
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-x-2">
        <Button type="submit" disabled={isUploading}>
          {post ? 'Update' : 'Create'} Report
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}