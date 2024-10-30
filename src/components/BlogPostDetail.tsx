'use client'

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
      {post.content.map((paragraph, index) => (
        <div key={index} className="mb-6">
          <div className="prose prose-sm max-w-none">
            {paragraph}
          </div>
          {post.images && post.images[index] && (
            <img 
              src={post.images[index]} 
              alt={`Content image ${index + 1}`} 
              className="mt-4 rounded-lg max-w-full h-auto"
            />
          )}
        </div>
      ))}
      <div className="text-center text-sm text-muted-foreground mt-4">
        Double click anywhere to close
      </div>
    </div>
  )
}