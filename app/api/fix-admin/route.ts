import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase client not available'
      }, { status: 500 })
    }

    // Delete existing admin user if exists
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('username', 'Admin.Asset@werk')

    // Insert admin user with correct hash
    const adminPasswordHash = "$2b$10$sQGSnA8WiIQMbHTssZeCTOKfNjVsBkqlB1y/Jxki/RFMoplr.SdP6" // werk@321
    
    const { data: newAdmin, error: insertError } = await supabase
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
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert admin user',
        details: insertError
      }, { status: 500 })
    }

    // Verify the admin user was inserted correctly
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'Admin.Asset@werk')
      .single()

    return NextResponse.json({
      message: 'Admin user fixed successfully',
      adminUser: {
        id: verifyAdmin?.id,
        username: verifyAdmin?.username,
        name: verifyAdmin?.name,
        role: verifyAdmin?.role
      },
      hasPasswordHash: !!verifyAdmin?.password_hash
    })

  } catch (error) {
    console.error('Fix admin error:', error)
    return NextResponse.json({
      error: 'Failed to fix admin user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
