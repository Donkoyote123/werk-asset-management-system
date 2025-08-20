import { NextRequest, NextResponse } from 'next/server'

// Database connection - works both locally and on Vercel
let sql: any;

async function getDatabase() {
  if (!sql) {
    try {
      // Try Vercel Postgres first (production)
      const { sql: vercelSql } = await import('@vercel/postgres');
      
      // Check if we have a connection string
      if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
        sql = vercelSql;
      } else {
        sql = null;
      }
    } catch (error) {
      console.log('Using in-memory fallback for development');
      sql = null;
    }
  }
  return sql;
}

// POST - Assign asset to user
export async function POST(request: NextRequest) {
  try {
    const database = await getDatabase();
    const { assetId, userId, assignedBy, notes } = await request.json();
    
    if (!assetId || !userId || !assignedBy) {
      return NextResponse.json(
        { error: 'Asset ID, User ID, and Assigned By are required' },
        { status: 400 }
      )
    }

    if (database) {
      // Use database (production)
      // Check if asset exists and is available
      const assetCheck = await database`
        SELECT id, name, status FROM assets 
        WHERE id = ${assetId} AND status = 'available'
      `;

      if (assetCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Asset not found or not available for assignment' },
          { status: 404 }
        )
      }

      // Get user name
      const userCheck = await database`
        SELECT name FROM users WHERE id = ${userId}
      `;

      if (userCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const userName = userCheck.rows[0].name;

      // Create assignment record
      await database`
        INSERT INTO asset_assignments (asset_id, user_id, assigned_by, date_assigned, notes, is_active)
        VALUES (${assetId}, ${userId}, ${assignedBy}, CURRENT_DATE, ${notes || null}, true)
      `;

      // Update asset status
      await database`
        UPDATE assets 
        SET status = 'assigned', assigned_to = ${userName}, assigned_date = CURRENT_DATE
        WHERE id = ${assetId}
      `;

      return NextResponse.json({
        message: 'Asset assigned successfully'
      });

    } else {
      // In-memory fallback would need assets and users arrays
      // For now, return success for development
      return NextResponse.json({
        message: 'Asset assignment simulated (development mode)'
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
    const database = await getDatabase();
    const { assetId, returnCondition, notes } = await request.json();
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    if (database) {
      // Use database (production)
      // Check if asset is assigned
      const assetCheck = await database`
        SELECT id, name, status FROM assets 
        WHERE id = ${assetId} AND status = 'assigned'
      `;

      if (assetCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Asset not found or not currently assigned' },
          { status: 404 }
        )
      }

      // Update assignment record
      await database`
        UPDATE asset_assignments 
        SET date_returned = CURRENT_DATE, return_condition = ${returnCondition || null}, 
            notes = COALESCE(notes, '') || ${notes ? '; Return: ' + notes : ''},
            is_active = false
        WHERE asset_id = ${assetId} AND is_active = true
      `;

      // Update asset status
      await database`
        UPDATE assets 
        SET status = 'available', assigned_to = NULL, assigned_date = NULL, return_date = CURRENT_DATE
        WHERE id = ${assetId}
      `;

      return NextResponse.json({
        message: 'Asset returned successfully'
      });

    } else {
      // In-memory fallback
      return NextResponse.json({
        message: 'Asset return simulated (development mode)'
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
