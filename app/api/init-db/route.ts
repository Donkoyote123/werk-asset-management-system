import { NextRequest, NextResponse } from 'next/server'
import { runMigrations, initializeDatabase } from '../../../lib/database'

// This endpoint will initialize your database with tables and sample data
// Call this once after setting up your Vercel PostgreSQL database
export async function POST(request: NextRequest) {
  try {
    // Check if we can connect to the database
    const canConnect = await initializeDatabase()
    
    if (!canConnect) {
      return NextResponse.json(
        { error: 'No database connection available. Please set up your database environment variables.' },
        { status: 500 }
      )
    }

    // Run migrations
    const migrationSuccess = await runMigrations()
    
    if (!migrationSuccess) {
      return NextResponse.json(
        { error: 'Database migration failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Database initialized successfully',
      status: 'success'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error during database initialization' },
      { status: 500 }
    )
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    const canConnect = await initializeDatabase()
    
    return NextResponse.json({
      database_connected: canConnect,
      timestamp: new Date().toISOString(),
      status: canConnect ? 'connected' : 'using_memory_fallback'
    })
  } catch (error) {
    return NextResponse.json({
      database_connected: false,
      error: 'Connection test failed',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }
}
