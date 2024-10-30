'use client'

import { Button } from "@/components/ui/button"

interface BlogPost {
  id: number
  title: string
  content: string[]
  images: { [key: string]: string }
  createdAt: number
}

interface BlogPostListProps {
  posts: BlogPost[]
  onSelectPost: (post: BlogPost) => void
  onEdit: (post: BlogPost) => void
  onDelete: (id: number) => void
}

export default function BlogPostList({ 
  posts = [], 
  onSelectPost,
  onEdit,
  onDelete
}: BlogPostListProps) {
  if (!Array.isArray(posts)) {
    return null
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts yet. Click "New Monthly Report" to create one.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border p-4 rounded-lg hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <div className="text-sm text-muted-foreground mb-3">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="mb-4 prose prose-sm">
              {post.content[0]?.slice(0, 150)}...
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => onSelectPost(post)}>Read More</Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(post)
                }}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(post.id)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}