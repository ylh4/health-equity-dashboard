import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'

// Helper function to handle authentication
async function handleAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Health Equity Dashboard"',
      },
    })
  }

  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true,
        message: 'Authentication successful'
      })
    }

    return new NextResponse(null, { 
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Health Equity Dashboard"',
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: 'Invalid credentials format'
    }, { 
      status: 400 
    })
  }
}

// Support both GET and POST methods
export async function GET(request: NextRequest) {
  return handleAuth(request)
}

export async function POST(request: NextRequest) {
  return handleAuth(request)
}