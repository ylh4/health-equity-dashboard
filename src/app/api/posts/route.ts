import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        images: body.images,
      },
    })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
} 