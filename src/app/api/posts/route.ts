import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()

// GET all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// CREATE new post
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))
    
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      )
    }

    if (typeof body.content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content must be a string' }), {
        status: 400,
      });
    }

    console.log('Content:', body.content);
    console.log('Content type:', typeof body.content);
    console.log('Is content array?', Array.isArray(body.content));

    const post = await prisma.post.create({
      data: {
        title: String(body.title),
        content: Array.isArray(body.content) ? body.content[0] : body.content,
        images: Array.isArray(body.images) ? body.images : [],
        createdAt: new Date(),
      },
    })
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// UPDATE post
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, images } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' }, 
        { status: 400 }
      )
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: Number(id)
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(images && { images }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE post
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' }, 
        { status: 400 }
      )
    }

    // Delete the post from the database
    await prisma.post.delete({
      where: {
        id: Number(id)
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ 
      error: 'Error deleting post' 
    }, { 
      status: 500 
    })
  } finally {
    await prisma.$disconnect()  // Clean up database connection
  }
}