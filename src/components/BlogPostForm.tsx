'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

interface BlogPost {
  id: number
  title: string
  content: string[]
  images: { [key: string]: string }
}

interface BlogPostFormProps {
  post?: BlogPost
  onSubmit: (post: BlogPost | Omit<BlogPost, 'id'>) => void
  onCancel: () => void
}

export default function BlogPostForm({ post, onSubmit, onCancel }: BlogPostFormProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState<string[]>(post?.content || [''])
  const [images, setImages] = useState<{ [key: string]: string }>(post?.images || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (post) {
      onSubmit({ ...post, title, content, images })
    } else {
      onSubmit({ title, content, images })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      setImages(prev => ({ ...prev, [index]: imageUrl }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter report title"
        required
      />
      {content.map((paragraph, index) => (
        <div key={index} className="space-y-2">
          <Textarea
            value={paragraph}
            onChange={(e) => {
              const newContent = [...content]
              newContent[index] = e.target.value
              setContent(newContent)
            }}
            placeholder={`Enter section ${index + 1} content`}
            required
            rows={6}
          />
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Image</DialogTitle>
                </DialogHeader>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, index)}
                />
              </DialogContent>
            </Dialog>
            {images[index] && (
              <img 
                src={images[index]} 
                alt={`Preview ${index + 1}`} 
                className="h-10 w-10 object-cover rounded"
              />
            )}
          </div>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setContent([...content, ''])}
      >
        Add Section
      </Button>
      <div className="space-x-2">
        <Button type="submit">
          {post ? 'Update' : 'Create'} Report
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}