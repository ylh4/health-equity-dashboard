import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Add this configuration
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
    
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        images: body.images || {},
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

    await prisma.post.delete({
      where: {
        id: Number(id)
      }
    })

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// UPDATE post
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, content, images } = body

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title, and content are required' }, 
        { status: 400 }
      )
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: Number(id)
      },
      data: {
        title,
        content,
        images: images || {}
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

// PATCH post (for partial updates)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

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
        ...updates
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error patching post:', error)
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}