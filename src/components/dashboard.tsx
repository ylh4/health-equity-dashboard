'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Activity, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface BlogPost {
  id: number
  title: string
  content: string[]
  images: { [key: string]: string }
  createdAt: number
}


function processMarkdown(text: string, images?: { [key: string]: string }): string {
    // Process headings first (to avoid conflicts)
    let processedText = text
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
      
      // Process nested bullet points with bold
      .replace(/^-- \*\*(.*?)\*\*/gm, '<li class="ml-8 mb-1"><strong>$1</strong></li>')
      .replace(/^-- (.*$)/gm, '<li class="ml-8 mb-1">$1</li>')
      .replace(/^- \*\*(.*?)\*\*/gm, '<li class="mb-1"><strong>$1</strong></li>')
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      
      // Process remaining bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Wrap lists in ul tags
      .replace(/(<li.*?<\/li>)[\n\r]*(<li.*?<\/li>)/g, '<ul class="my-4">$1$2</ul>')
  
    // Handle images
    if (images) {
      processedText = processedText.replace(/!\[Image\]$$(\d+-\d+)$$/g, (_, imageKey) => {
        const imageUrl = images[imageKey]
        if (!imageUrl) return ''
        
        return `
          <div class="relative my-4 max-w-full">
            <img
              src="${imageUrl}"
              alt="Content image"
              class="rounded-lg shadow-sm max-w-full h-auto mx-auto"
              style="max-height: 500px; object-fit: contain;"
              loading="lazy"
            />
          </div>
        `
      })
    }
  
    // Handle paragraphs and line breaks
    processedText = processedText
      .replace(/\n\n/g, '</p><p class="my-1">')
      .replace(/\n/g, '<br />')
  
    // Wrap in paragraph if not already wrapped in HTML
    if (!processedText.match(/^<[^>]+>/)) {
      processedText = `<p class="my-1">${processedText}</p>`
    }
  
    return processedText
  
}

function Logo() {
  return (
    <div className="flex items-center">
      <Activity className="h-8 w-8 mr-2 text-primary" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary">Health Equity Dashboard</span>
        <span className="text-sm text-muted-foreground">Monthly Insights</span>
      </div>
    </div>
  )
}

interface BlogPostFormProps {
  post?: BlogPost
  onSubmit: (post: BlogPost | Omit<BlogPost, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

function BlogPostForm({ post, onSubmit, onCancel }: BlogPostFormProps) {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState<string[]>(() => {
    if (post?.content) {
      return post.content.map((text, index) => {
        return text.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, `\n[Image #${index}]\n`)
      })
    }
    return ['']
  })
  const [images, setImages] = useState<{ [key: string]: string }>(post?.images || {})
  const [cursorPositions, setCursorPositions] = useState<{ [key: number]: number }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const processedContent = content.map((text, index) => {
      return text.replace(/\[Image #\d+\]/g, () => {
        const imageKey = Object.keys(images).find(key => key.startsWith(`${index}-`))
        if (imageKey && images[imageKey]) {
          return `![Image]$$${imageKey}$$`
        }
        return ''
      })
    })

    if (post?.id) {
      onSubmit({ ...post, title, content: processedContent, images })
    } else {
      onSubmit({ title, content: processedContent, images })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        const imageKey = `${index}-${Date.now()}`
        setImages(prev => ({ ...prev, [imageKey]: imageUrl }))

        const textarea = document.querySelector(`textarea[name="paragraph-${index}"]`) as HTMLTextAreaElement
        if (!textarea) return

        const cursorPos = cursorPositions[index] || textarea.selectionStart
        const textBefore = content[index].substring(0, cursorPos)
        const textAfter = content[index].substring(cursorPos)
        
        const imagePlaceholder = `\n[Image #${index}]\n`
        const newContent = [...content]
        newContent[index] = textBefore + imagePlaceholder + textAfter
        setContent(newContent)

        const newPos = cursorPos + imagePlaceholder.length
        setCursorPositions({ ...cursorPositions, [index]: newPos })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>, index: number) => {
    const textarea = e.currentTarget
    setCursorPositions({ ...cursorPositions, [index]: textarea.selectionStart })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
        className="text-lg font-medium"
        required
      />
      <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
        <p>Formatting Guide:</p>
        <p># Text - Heading 1</p>
        <p>## Text - Heading 2</p>
        <p>### Text - Heading 3</p>
        <p>**Text** - Bold text</p>
        <p>- Text - Bullet point</p>
        <p>-- Text - Nested bullet point</p>
        <p>- **Text** - Bold bullet point</p>
        <p>-- **Text** - Bold nested bullet point</p>
      </div>
      {content.map((text, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>Upload Image</DialogTitle>
                  <p id="dialog-description" className="text-sm text-muted-foreground">
                    Select an image file to upload to your post.
                  </p>
                </DialogHeader>
                <Input
                  type="file"
                  onChange={(e) => handleImageUpload(e, index)}
                  accept="image/*"
                  aria-label="Upload image"
                />
              </DialogContent>
            </Dialog>
            <div className="flex gap-2 overflow-x-auto">
              {Object.entries(images).map(([key, url]) => {
                if (key.startsWith(`${index}-`)) {
                  return (
                    <div key={key} className="relative w-10 h-10">
                      <img 
                        src={url}
                        alt={`Content image ${key}`}
                        className="object-cover rounded shadow-sm w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
          <Textarea
            name={`paragraph-${index}`}
            value={text}
            onChange={(e) => {
              const newContent = [...content]
              newContent[index] = e.target.value
              setContent(newContent)
            }}
            onSelect={(e) => handleCursorChange(e, index)}
            onClick={(e) => handleCursorChange(e, index)}
            onKeyUp={(e) => handleCursorChange(e, index)}
            placeholder={`Enter section ${index + 1} content`}
            className="min-h-[150px] font-mono"
            required
          />
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">Preview:</div>
            <div 
              className="p-4 border rounded-lg prose prose-sm max-w-none mt-1"
              dangerouslySetInnerHTML={{ 
                __html: processMarkdown(text, images)
              }}
            />
          </div>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setContent([...content, ''])}
        className="w-full"
      >
        Add Section
      </Button>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {post ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  )
}

interface BlogPostDetailProps {
  post: BlogPost
  onClose: () => void
}


function BlogPostDetail({ post, onClose }: BlogPostDetailProps) {
    if (!post) return null
  
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
          <div 
            key={index} 
            className="mb-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: processMarkdown(paragraph, post.images)
            }}
          />
        ))}
        <div className="text-center text-sm text-muted-foreground mt-4">
          Double click anywhere to close
        </div>
      </div>
    )
  }
  
interface BlogPostListProps {
  posts: BlogPost[]
  onSelectPost: (post: BlogPost) => void
  onEdit: (post: BlogPost) => void
  onDelete: (id: number) => void
}

function BlogPostList({ posts, onSelectPost, onEdit, onDelete }: BlogPostListProps) {
    if (!Array.isArray(posts)) return null
  
    return (
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts yet. Click &quot;New Monthly Report&quot; to create one.</p>
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
              <div 
                className="mb-4 prose prose-sm"
                dangerouslySetInnerHTML={{ 
                  __html: processMarkdown(
                    post.content[0]?.slice(0, 150) + '...', 
                    post.images
                  )
                }} 
              />
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
  
export default function Dashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const credentials = sessionStorage.getItem('credentials')
      
      if (!credentials) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          sessionStorage.removeItem('credentials')
          router.push('/login')
        } else {
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Auth  check error:', err)
        sessionStorage.removeItem('credentials')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
  
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    sessionStorage.removeItem('credentials')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }
  
  // Update addPost function
  const addPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      if (response.ok) {
        const newPost = await response.json()
        setPosts([newPost, ...posts])
        setIsEditing(false)
        setEditingPost(null)
      }
    } catch (error) {
      console.error('Error adding post:', error)
    }
  }

  const updatePost = async (updatedPost: BlogPost) => {
    if (!updatedPost?.id) return
    
    try {
      const response = await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedPost.title,
          content: updatedPost.content,
          images: updatedPost.images || {}
        }),
      })
      
      if (response.ok) {
        const processedPost = await response.json()
        setPosts(posts.map(post => post.id === updatedPost.id ? processedPost : post))
        setSelectedPost(null)
        setIsEditing(false)
        setEditingPost(null)
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }  
  
  const deletePost = (id: number) => {
    if (!id) return
    setPosts(posts.filter(post => post.id !== id))
    setSelectedPost(null)
  }

  const handleEdit = (post: BlogPost) => {
    if (!post?.id) return
    setEditingPost(post)
    setIsEditing(true)
    setSelectedPost(null)
  }

  const sortedPosts = [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sky-100 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          {!selectedPost && !isEditing && (
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => {
                  setIsEditing(true)
                  setEditingPost(null)
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> New Monthly Report
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 overflow-y-auto">
        {isEditing ? (
          <div className="max-w-4xl mx-auto">
            <BlogPostForm 
              post={editingPost || undefined}
              onSubmit={(post) => {
                if ('id' in post) {
                  updatePost(post)
                } else {
                  addPost(post)
                }
              }}
              onCancel={() => {
                setIsEditing(false)
                setEditingPost(null)
              }} 
            />
          </div>
        ) : selectedPost ? (
          <div className="max-w-4xl mx-auto">
            <BlogPostDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <BlogPostList 
              posts={sortedPosts}
              onSelectPost={setSelectedPost}
              onEdit={handleEdit}
              onDelete={deletePost}
            />
          </div>
        )}
      </main>

      <footer className="bg-sky-100 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Health Equity Dashboard: Monthly Insights. All rights reserved.
        </p>
      </footer>
    </div>
  )
}