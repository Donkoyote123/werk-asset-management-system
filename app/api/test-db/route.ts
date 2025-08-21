import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // First, let's try importing the sql from @vercel/postgres
    const { sql } = await import('@vercel/postgres')
    
    console.log('Environment check:')
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL)
    console.log('POSTGRES_URL starts with postgres:', process.env.POSTGRES_URL?.startsWith('postgres:'))
    
    // Try the connection
    try {
      console.log('Attempting database connection...')
      const result = await sql`SELECT NOW() as current_time, version() as db_version`
      console.log('Connection successful!')
      
      return NextResponse.json({
        status: 'success',
        connected: true,
        timestamp: result.rows[0].current_time,
        database_version: result.rows[0].db_version.split(' ')[0],
        environment: process.env.VERCEL_ENV || 'development'
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      
      return NextResponse.json({
        status: 'database_error',
        connected: false,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        error_code: dbError instanceof Error && 'code' in dbError ? (dbError as any).code : 'unknown',
        postgres_url_exists: !!process.env.POSTGRES_URL,
        postgres_url_format: process.env.POSTGRES_URL?.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      })
    }
  } catch (importError) {
    console.error('Import error:', importError)
    
    return NextResponse.json({
      status: 'import_error',
      connected: false,
      error: importError instanceof Error ? importError.message : 'Unknown import error',
      timestamp: new Date().toISOString()
    })
  }
}
