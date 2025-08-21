import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(envCheck)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      timestamp: new Date().toISOString() 
    }, { status: 500 })
  }
}
