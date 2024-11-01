'use client'

import Image from 'next/image'

interface BlogPost {
  id: number
  title: string
  content: string[]
  images: { [key: string]: string }
  createdAt: number
}

interface BlogPostDetailProps {
  post: BlogPost
  onClose: () => void
}

export default function BlogPostDetail({ 
  post,
  onClose,
}: BlogPostDetailProps) {
  if (!post) {
    return null
  }

  // Convert object of images to array for easier handling
  const imageArray = Object.values(post.images).filter(Boolean)

  return (
    <div 
      className="space-y-4 cursor-pointer" 
      onDoubleClick={onClose}
      role="article"
      aria-label="Double click to close"
    >
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <div className="text-sm text-muted-foreground mb-6">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      {/* Content and Images */}
      {post.content.map((paragraph, index) => (
        <div key={index} className="mb-6">
          <div className="prose prose-sm max-w-none">
            {paragraph}
          </div>
          {post.images && post.images[index] && (
            <div className="relative mt-4 h-[300px] w-full">
              <Image 
                src={post.images[index]} 
                alt={`Content image ${index + 1}`} 
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                onError={(e) => {
                  // Fallback for broken images
                  const imgElement = e.target as HTMLImageElement
                  imgElement.src = '/placeholder.jpg' // Add a placeholder image in your public folder
                  imgElement.className = 'rounded-lg max-w-full h-auto opacity-50'
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Image Gallery for any additional images */}
      {imageArray.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {imageArray.map((imageUrl, index) => (
            <div key={`gallery-${index}`} className="relative aspect-square">
              <Image
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                fill
                className="rounded-lg object-cover hover:opacity-90 transition-opacity"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mt-4">
        Double click anywhere to close
      </div>
    </div>
  )
}