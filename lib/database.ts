import { createClient } from '@supabase/supabase-js'

// Database connection utility for Supabase
export async function initializeDatabase() {
  try {
    // Check if we have Supabase connection details
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('No Supabase connection details found. Using in-memory storage.')
      console.log('SUPABASE_URL exists:', !!supabaseUrl)
      console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY)
      return false
    }

    console.log('Attempting Supabase connection...')
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test the connection by trying a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('Supabase database connection successful')
    return true
  } catch (error) {
    console.error('Supabase database connection failed:', error)
    return false
  }
}

// Run database migrations/initialization for Supabase
export async function runMigrations() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials for migration')
      return false
    }

    console.log('Running Supabase database migrations...')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if users table exists by trying to select from it
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError && usersError.code === '42P01') {
      // Table doesn't exist
      console.log('Users table does not exist. You need to create the database tables first.')
      console.log('Please run the SQL commands in the Supabase SQL editor to create the tables.')
      return false
    }

    // Check if assets table exists
    const { data: assetsTest, error: assetsError } = await supabase
      .from('assets')
      .select('id')
      .limit(1)
    
    if (assetsError && assetsError.code === '42P01') {
      console.log('Assets table does not exist. You need to create the database tables first.')
      return false
    }

    console.log('Database tables verified successfully')
    
    // Insert initial admin user if it doesn't exist
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'Admin.Asset@werk')
      .single()

    if (!existingAdmin) {
      // Use the same pre-computed hash as in userStore for consistency
      const adminPasswordHash = "$2b$10$sQGSnA8WiIQMbHTssZeCTOKfNjVsBkqlB1y/Jxki/RFMoplr.SdP6" // werk@321
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: 'Admin.Asset@werk',
          password_hash: adminPasswordHash,
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@werk.com',
          id_number: 'ADM001',
          mobile_number: '+254700000000',
          is_active: true
        })

      if (insertError) {
        console.error('Failed to create admin user:', insertError)
        return false
      }
      
      console.log('Initial admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }

    return true
  } catch (error) {
    console.error('Failed to run migrations:', error)
    return false
  }
}

// Helper function to get Supabase client
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}
