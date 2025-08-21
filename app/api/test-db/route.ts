import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Check for Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    console.log('Environment check:')
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY)
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        status: 'missing_credentials',
        connected: false,
        error: 'Missing Supabase URL or API key',
        supabase_url_exists: !!supabaseUrl,
        supabase_service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabase_anon_key_exists: !!process.env.SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString()
      })
    }

    // Try the connection
    try {
      console.log('Attempting Supabase connection...')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Test connection by trying to query users table
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error && error.code === '42P01') {
        // Table doesn't exist - that's expected if tables haven't been created yet
        return NextResponse.json({
          status: 'connected_but_no_tables',
          connected: true,
          message: 'Connected to Supabase but tables need to be created',
          error: 'Users table does not exist',
          timestamp: new Date().toISOString()
        })
      }
      
      if (error) {
        console.error('Supabase query error:', error)
        return NextResponse.json({
          status: 'query_error',
          connected: false,
          error: error.message,
          error_code: error.code,
          timestamp: new Date().toISOString()
        })
      }
      
      console.log('Supabase connection successful!')
      
      return NextResponse.json({
        status: 'success',
        connected: true,
        message: 'Successfully connected to Supabase',
        tables_exist: true,
        timestamp: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      
      return NextResponse.json({
        status: 'database_error',
        connected: false,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        supabase_url_format: supabaseUrl.substring(0, 30) + '...',
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
