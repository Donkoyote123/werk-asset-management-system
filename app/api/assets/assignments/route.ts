import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/database'

// POST - Assign asset to user
export async function POST(request: NextRequest) {
  try {
    const { assetId, userId, assignedBy, notes } = await request.json();
    
    if (!assetId || !userId || !assignedBy) {
      return NextResponse.json(
        { error: 'Asset ID, User ID, and Assigned By are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Check if asset exists and is available
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select('id, name, status')
        .eq('id', assetId)
        .eq('status', 'available')
        .single()

      if (assetError || !asset) {
        return NextResponse.json(
          { error: 'Asset not found or not available for assignment' },
          { status: 404 }
        )
      }

      // Get user name
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Create assignment record in asset_assignments table
      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert({
          asset_id: assetId,
          user_id: userId,
          assigned_by: assignedBy,
          assigned_date: new Date().toISOString(),
          notes: notes || null,
          status: 'active'
        })

      if (assignmentError) {
        console.error('Assignment error:', assignmentError)
        return NextResponse.json(
          { error: 'Failed to create assignment record' },
          { status: 500 }
        )
      }

      // Update asset status
      const { error: updateError } = await supabase
        .from('assets')
        .update({ 
          status: 'assigned',
          assigned_to: userId,  // Use user ID instead of name
          assigned_date: new Date().toISOString()
        })
        .eq('id', assetId)

      if (updateError) {
        console.error('Asset update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update asset status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Asset assigned successfully',
        assignment: {
          assetId,
          assetName: asset.name,
          userId,
          userName: user.name,
          assignedBy,
          assignedDate: new Date().toISOString().split('T')[0]
        }
      });

    } else {
      // In-memory fallback for development
      return NextResponse.json({
        message: 'Asset assignment simulated (development mode - no database)',
        assignment: {
          assetId,
          userId,
          assignedBy,
          assignedDate: new Date().toISOString().split('T')[0]
        }
      });
    }

  } catch (error) {
    console.error('Error assigning asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Return asset
export async function PUT(request: NextRequest) {
  try {
    const { assetId, returnCondition, notes } = await request.json();
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Check if asset is assigned
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select('id, name, status, assigned_to')
        .eq('id', assetId)
        .eq('status', 'assigned')
        .single()

      if (assetError || !asset) {
        return NextResponse.json(
          { error: 'Asset not found or not currently assigned' },
          { status: 404 }
        )
      }

      // Update assignment record to mark as returned
      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .update({
          returned_date: new Date().toISOString(),
          notes: notes ? (notes + ' | Return notes') : 'Asset returned',
          status: 'returned'
        })
        .eq('asset_id', assetId)
        .eq('status', 'active')

      if (assignmentError) {
        console.error('Assignment update error:', assignmentError)
        return NextResponse.json(
          { error: 'Failed to update assignment record' },
          { status: 500 }
        )
      }

      // Update asset status to available
      const { error: updateError } = await supabase
        .from('assets')
        .update({ 
          status: 'available',
          assigned_to: null,
          assigned_date: null
        })
        .eq('id', assetId)

      if (updateError) {
        console.error('Asset update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update asset status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Asset returned successfully',
        return: {
          assetId,
          assetName: asset.name,
          returnedBy: asset.assigned_to,
          returnDate: new Date().toISOString().split('T')[0],
          returnCondition: returnCondition || 'Good'
        }
      });

    } else {
      // In-memory fallback for development
      return NextResponse.json({
        message: 'Asset return simulated (development mode - no database)',
        return: {
          assetId,
          returnDate: new Date().toISOString().split('T')[0],
          returnCondition: returnCondition || 'Good'
        }
      });
    }

  } catch (error) {
    console.error('Error returning asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
