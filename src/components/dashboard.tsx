'use client'

import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Activity, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

declare global {
  interface Window {
    cloudinary: any;
  }
}

function Logo() {
  return (
    <div className="flex items-center">
      <Activity className="h-8 w-8 mr-2 text-primary" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary">Health Equity Dashboard</span>
        <span className="text-sm text-muted-foreground">Monthly Insights: Contact Yared Hurisa for further information</span>
      </div>
    </div>
  );
}

export { Logo };

interface BlogPost {
    id: number
    title: string
    content: string  // Changed from string[] to string
    images: string[] // Changed from object to string array
    createdAt: number
  }

  function processMarkdown(text: string, images?: string[]): string {
    if (!text) return '';
    
    let processedText = text;
    const imageUrls = [...(images || [])];

    // Split content into sections
    const sections = processedText.split(/(?=^# )/gm);

    // Process each section
    processedText = sections.map(section => {
      if (!section.trim()) return '';

      let sectionContent = section;

      // Process headings
      sectionContent = sectionContent
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');

      // Process bullet points
      sectionContent = sectionContent
        .replace(/^-- \*\*(.*?)\*\*/gm, '<li class="ml-8 mb-1"><strong>$1</strong></li>')
        .replace(/^-- (.*$)/gm, '<li class="ml-8 mb-1">$1</li>')
        .replace(/^- \*\*(.*?)\*\*/gm, '<li class="mb-1"><strong>$1</strong></li>')
        .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>');

      // Wrap bullet points in ul tags
      sectionContent = sectionContent.replace(
        /(<li[^>]*>.*<\/li>\n*)+/g,
        match => `<ul class="list-disc list-inside my-4">${match}</ul>`
      );

      // Process images
      sectionContent = sectionContent.replace(/\[Image\]/g, () => {
        const imageUrl = imageUrls.shift();
        if (!imageUrl) return '';
        
        return `
          <div class="my-6">
            <img 
              src="${imageUrl}"
              alt="Content image"
              class="rounded-lg shadow-sm max-w-full h-auto mx-auto"
              style="max-height: 500px; object-fit: contain;"
            />
          </div>
        `.trim();
      });

      // Process bold text
      sectionContent = sectionContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Process paragraphs
      sectionContent = sectionContent
        .split('\n\n')
        .map(para => {
          para = para.trim();
          if (!para) return '';
          if (para.startsWith('<')) return para;
          return `<p class="my-4">${para.replace(/\n/g, '<br />')}</p>`;
        })
        .filter(Boolean)
        .join('\n');

      return `<section class="mb-8">${sectionContent}</section>`;
    }).join('\n');

    return processedText;
  }

  // Update BlogPostContent component
  function BlogPostContent({ content, images }: { content: string, images: string[] }) {
    const [isClient, setIsClient] = useState(false)
    
    useEffect(() => {
      setIsClient(true)
    }, [])

    const processedContent = useMemo(() => {
      return processMarkdown(content, images)
    }, [content, images])

    if (!isClient) {
      return <div>Loading...</div>
    }

    return (
      <div className="prose prose-sm max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: processedContent }} 
          className="space-y-4"
        />
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
    const [content, setContent] = useState(() => {
      if (post?.content) {
        return post.content.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, '\n[Image]\n')
      }
      return ''
    })
    const [images, setImages] = useState<string[]>(post?.images || [])
    const [cursorPosition, setCursorPosition] = useState<number>(0)
    const [isClient, setIsClient] = useState(false)
  
    useEffect(() => {
      setIsClient(true)
      // Load Cloudinary script
      const script = document.createElement('script')
      script.src = 'https://upload-widget.cloudinary.com/global/all.js'
      script.async = true
      document.body.appendChild(script)
    }, [])
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      let processedContent = content
      
      // Don't modify the content directly, let processMarkdown handle it
      if (post?.id) {
        onSubmit({ ...post, title, content: processedContent, images })
      } else {
        onSubmit({ title, content: processedContent, images })
      }
    }
  
    const handleImageUpload = () => {
      if (!isClient) return // Don't run on server
      
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: 'health_dashboard',
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            const imageUrl = result.info.secure_url
            setImages(prev => [...prev, imageUrl])
            insertImagePlaceholder(imageUrl)
          }
        }
      )

      widget.open()
    }

    const insertImagePlaceholder = (imageUrl: string) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (!textarea) return

      const cursorPos = cursorPosition || textarea.selectionStart
      const textBefore = content.substring(0, cursorPos)
      const textAfter = content.substring(cursorPos)
      
      const imagePlaceholder = '\n[Image]\n'
      setContent(textBefore + imagePlaceholder + textAfter)

      const newPos = cursorPos + imagePlaceholder.length
      setCursorPosition(newPos)
    }

    const compressImage = async (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = document.createElement('img')
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 1200
            const MAX_HEIGHT = 1200
            let width = img.width
            let height = img.height

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  reject(new Error('Canvas to Blob conversion failed'))
                }
              },
              'image/jpeg',
              0.7
            )
          }
          img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }
  
    const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget
      setCursorPosition(textarea.selectionStart)
    }
  
    // Render loading state or null during server-side rendering
    if (!isClient) {
      return <div>Loading...</div>
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
        <div className="space-y-2 border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" onClick={handleImageUpload}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="flex gap-2 overflow-x-auto">
              {images.map((url, index) => (
                <div key={index} className="relative w-10 h-10">
                  <img 
                    src={url}
                    alt={`Content image ${index}`}
                    className="object-cover rounded shadow-sm w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            placeholder="Enter content"
            className="min-h-[300px] font-mono"
            required
          />
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">Preview:</div>
            <div 
              className="p-4 border rounded-lg prose prose-sm max-w-none mt-1"
              dangerouslySetInnerHTML={{ 
                __html: processMarkdown(content)
              }}
            />
          </div>
        </div>
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
  return (
    <div 
      className="space-y-4"
      onDoubleClick={onClose}
      role="button"
      tabIndex={0}
      title="Double-click to close"
    >
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <BlogPostContent content={post.content} images={post.images} />
      <p className="text-sm text-muted-foreground text-center mt-4">
        Double-click anywhere to close
      </p>
    </div>
  );
}

interface BlogPostListProps {
  posts: BlogPost[]
  onSelectPost: (post: BlogPost) => void
  onEdit: (post: BlogPost) => void
  onDelete: (id: number) => void
}

function BlogPostList({ posts, onSelectPost, onEdit, onDelete }: BlogPostListProps) {
  // Sort posts by date (newest first)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get preview content (first few lines, up to first image or 150 characters)
  const getPreviewContent = (content: string) => {
    const textBeforeImage = content.split('[Image]')[0];
    const preview = textBeforeImage.split('\n')
      .filter(line => !line.startsWith('#'))  // Remove headings
      .join(' ')
      .trim();
    return preview.length > 150 
      ? preview.substring(0, 150) + '...'
      : preview;
  };

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div 
          key={post.id} 
          className="border p-4 rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <span className="text-sm text-muted-foreground">
              {formatDate(post.createdAt)}
            </span>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {getPreviewContent(post.content)}
          </p>

          <div className="flex items-center gap-2">
            <Button onClick={() => onSelectPost(post)}>Read More</Button>
            <Button variant="outline" onClick={() => onEdit(post)}>Edit</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  onDelete(post.id)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
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

  const addPost = async (newPost: Omit<BlogPost, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      })
      
      if (response.ok) {
        const createdPost = await response.json()
        setPosts([...posts, createdPost])
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error adding post:', error)
    }
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

  const updatePost = async (updatedPost: BlogPost) => {
    if (!updatedPost?.id) return
    
    try {
      const formattedPost = {
        title: updatedPost.title,
        content: updatedPost.content,
        images: updatedPost.images
      }
  
      const response = await fetch(`/api/posts`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${sessionStorage.getItem('credentials')}`
        },
        body: JSON.stringify({
          id: updatedPost.id,
          ...formattedPost
        }),
      })
      
      if (response.ok) {
        const processedPost = await response.json()
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === updatedPost.id ? processedPost : post
          )
        )
        setSelectedPost(null)
        setIsEditing(false)
        setEditingPost(null)
      } else {
        console.error('Failed to update post:', await response.text())
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const deletePost = async (id: number) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/posts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${sessionStorage.getItem('credentials')}`
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        // Only remove from state if delete was successful
        setPosts(posts.filter(post => post.id !== id));
        setSelectedPost(null);
      } else {
        console.error('Failed to delete post:', await response.text());
        // Optionally add error handling UI here
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Optionally add error handling UI here
    }
  };

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