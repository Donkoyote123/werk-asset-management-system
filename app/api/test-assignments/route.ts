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

    // Get assets with assignment information
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, name, status, assigned_to, assigned_date')
      .order('id')

    // Get recent assignment history
    const { data: assignments, error: assignmentsError } = await supabase
      .from('asset_assignments')
      .select(`
        id, asset_id, user_id, assigned_by, date_assigned, date_returned, 
        return_condition, is_active
      `)
      .order('date_assigned', { ascending: false })
      .limit(10)

    const response = {
      assets: assetsError ? [] : assets,
      recentAssignments: assignmentsError ? [] : assignments,
      errors: {
        assets: assetsError?.message || null,
        assignments: assignmentsError?.message || null
      },
      status: 'API endpoints working correctly'
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      status: 'API test failed'
    }, { status: 500 })
  }
}
