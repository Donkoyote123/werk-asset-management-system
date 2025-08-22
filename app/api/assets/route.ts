import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/database'

// In-memory fallback assets for development
const INITIAL_ASSETS: Asset[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    category: 'Laptops',
    serialNumber: 'MBP2023001',
    tagNumber: 'WERK-LT-001',
    status: 'available',
    purchaseDate: '2024-01-15',
    purchaseCost: 2500.00,
    description: 'MacBook Pro 16-inch M2 Max',
    createdDate: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    category: 'Mobile Device',
    serialNumber: 'IP15P001',
    tagNumber: 'WERK-MB-001',
    status: 'available',
    purchaseDate: '2024-02-01',
    purchaseCost: 1200.00,
    description: 'iPhone 15 Pro 256GB',
    createdDate: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Dell Monitor 27"',
    category: 'Monitor',
    serialNumber: 'DM27001',
    tagNumber: 'WERK-MN-001',
    status: 'available',
    purchaseDate: '2024-01-20',
    purchaseCost: 450.00,
    description: 'Dell 27-inch 4K Monitor',
    createdDate: '2024-01-20T00:00:00.000Z',
  },
]

let memoryAssets: Asset[] = [...INITIAL_ASSETS]

// Types
interface Asset {
  id: number
  name: string
  category: string
  serialNumber: string
  tagNumber: string
  status: 'available' | 'assigned' | 'returned' | 'maintenance' | 'retired'
  assignedTo?: string
  assignedDate?: string
  returnDate?: string
  purchaseDate?: string
  purchaseCost?: number
  description?: string
  createdDate: string
}

interface NewAssetData {
  name: string
  category: string
  serialNumber: string
  purchaseDate?: string
  purchaseCost?: number
  description?: string
}

// Utility function to generate tag numbers
function generateTagNumber(category: string): string {
  const categoryPrefix: Record<string, string> = {
    'Laptops': 'LT',
    'Mobile Device': 'MB', 
    'Monitor': 'MN',
    'Peripherals': 'PR',
    'Network Equipment': 'NT',
    'Office Equipment': 'OF',
    'Furniture': 'FR',
    'Software': 'SW'
  }

  const prefix = categoryPrefix[category] || 'AS'
  const random = Math.floor(Math.random() * 9999).toString().padStart(3, '0')
  
  return `WERK-${prefix}-${random}`
}

// GET - Fetch all assets
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Use Supabase database
      const { data: assetsFromDb, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        // Fallback to in-memory storage
        return NextResponse.json(memoryAssets)
      }

      // Transform database format to match frontend expectations
      const transformedAssets = assetsFromDb.map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serial_number,
        tagNumber: asset.tag_number,
        status: asset.status,
        assignedTo: asset.assigned_to,
        assignedDate: asset.assigned_date,
        returnDate: asset.return_date,
        purchaseDate: asset.purchase_date,
        purchaseCost: asset.purchase_cost,
        description: asset.description,
        createdDate: asset.created_date,
      }))

      return NextResponse.json(transformedAssets)
    } else {
      // Use in-memory fallback
      return NextResponse.json(memoryAssets)
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    // Fallback to in-memory storage on any error
    return NextResponse.json(memoryAssets)
  }
}

// POST - Create new asset
export async function POST(request: NextRequest) {
  try {
    const assetData: NewAssetData = await request.json()
    
    // Validation
    if (!assetData.name || !assetData.category || !assetData.serialNumber) {
      return NextResponse.json(
        { error: 'Name, category, and serial number are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Use Supabase database
      // Check if asset with serial number already exists
      const { data: existingAsset, error: checkError } = await supabase
        .from('assets')
        .select('id')
        .eq('serial_number', assetData.serialNumber)
        .single()

      if (existingAsset && !checkError) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 409 }
        )
      }

      // Generate unique tag number
      let tagNumber = generateTagNumber(assetData.category)
      let attempts = 0
      while (attempts < 10) {
        const { data: tagExists, error: tagError } = await supabase
          .from('assets')
          .select('id')
          .eq('tag_number', tagNumber)
          .single()

        if (!tagExists || tagError) break
        tagNumber = generateTagNumber(assetData.category)
        attempts++
      }

      // Insert new asset
      const { data: newAsset, error: insertError } = await supabase
        .from('assets')
        .insert({
          name: assetData.name,
          category: assetData.category,
          serial_number: assetData.serialNumber,
          tag_number: tagNumber,
          status: 'available',
          purchase_date: assetData.purchaseDate || null,
          purchase_cost: assetData.purchaseCost || null,
          description: assetData.description || null
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to create asset' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Asset created successfully',
        asset: {
          id: newAsset.id,
          name: newAsset.name,
          category: newAsset.category,
          serialNumber: newAsset.serial_number,
          tagNumber: newAsset.tag_number,
          status: newAsset.status,
          purchaseDate: newAsset.purchase_date,
          purchaseCost: newAsset.purchase_cost,
          description: newAsset.description,
          createdDate: newAsset.created_date,
        }
      })
    } else {
      // Use in-memory fallback
      // Check if asset already exists
      if (memoryAssets.some(asset => asset.serialNumber === assetData.serialNumber)) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 409 }
        )
      }

      // Generate unique tag number
      let tagNumber = generateTagNumber(assetData.category)
      while (memoryAssets.some(asset => asset.tagNumber === tagNumber)) {
        tagNumber = generateTagNumber(assetData.category)
      }

      // Create new asset
      const newAsset: Asset = {
        id: Date.now(),
        name: assetData.name,
        category: assetData.category,
        serialNumber: assetData.serialNumber,
        tagNumber: tagNumber,
        status: 'available',
        purchaseDate: assetData.purchaseDate,
        purchaseCost: assetData.purchaseCost,
        description: assetData.description,
        createdDate: new Date().toISOString(),
      }

      // Add to assets array
      memoryAssets.push(newAsset)

      return NextResponse.json({
        message: 'Asset created successfully',
        asset: newAsset
      })
    }

  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('id')
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Use Supabase database
      // Check if asset exists and get its status
      const { data: asset, error: fetchError } = await supabase
        .from('assets')
        .select('id, status')
        .eq('id', assetId)
        .single()

      if (!asset || fetchError) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      // Check if asset is currently assigned
      if (asset.status === 'assigned') {
        return NextResponse.json(
          { error: 'Cannot delete assigned asset. Please return it first.' },
          { status: 409 }
        )
      }

      // Delete asset
      const { error: deleteError } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete asset' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Asset deleted successfully'
      })
    } else {
      // Use in-memory fallback
      const assetIndex = memoryAssets.findIndex(asset => asset.id === parseInt(assetId))
      
      if (assetIndex === -1) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      // Check if asset is currently assigned
      if (memoryAssets[assetIndex].status === 'assigned') {
        return NextResponse.json(
          { error: 'Cannot delete assigned asset. Please return it first.' },
          { status: 409 }
        )
      }

      // Remove asset from array
      memoryAssets.splice(assetIndex, 1)

      return NextResponse.json({
        message: 'Asset deleted successfully'
      })
    }

  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
