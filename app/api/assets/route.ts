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
        // Initialize database tables if needed
        await initDatabase();
      } else {
        sql = null;
      }
    } catch (error) {
      // Fallback to in-memory storage for local development
      sql = null;
    }
  }
  return sql;
}

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

// In-memory fallback for development
const INITIAL_ASSETS: Asset[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    category: 'Laptop',
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

let assets: Asset[] = [...INITIAL_ASSETS]

async function initDatabase() {
  if (!sql) return;
  
  try {
    // Create asset_categories table
    await sql`
      CREATE TABLE IF NOT EXISTS asset_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create assets table
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        tag_number VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        assigned_to VARCHAR(100),
        assigned_date DATE,
        return_date DATE,
        purchase_date DATE,
        purchase_cost DECIMAL(10,2),
        description TEXT,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create asset_assignments table for tracking history
    await sql`
      CREATE TABLE IF NOT EXISTS asset_assignments (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
        user_id INTEGER,
        assigned_by INTEGER,
        date_assigned DATE NOT NULL,
        date_returned DATE,
        return_condition TEXT,
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default categories if not exist
    const categoriesExist = await sql`SELECT COUNT(*) FROM asset_categories`;
    if (categoriesExist.rows[0].count === '0') {
      await sql`
        INSERT INTO asset_categories (name, description) VALUES
        ('Laptops', 'Desktop and laptop computers'),
        ('Mobile Device', 'Smartphones and tablets'),
        ('Monitor', 'Computer monitors and displays'),
        ('Peripherals', 'Keyboards, mice, printers, etc.'),
        ('Network Equipment', 'Routers, switches, access points'),
        ('Office Equipment', 'Printers, scanners, projectors'),
        ('Furniture', 'Desks, chairs, cabinets'),
        ('Software', 'Software licenses and applications')
      `;
    }

    // Insert initial assets if not exist
    const assetsExist = await sql`SELECT COUNT(*) FROM assets`;
    if (assetsExist.rows[0].count === '0') {
      for (const asset of INITIAL_ASSETS) {
        await sql`
          INSERT INTO assets (name, category, serial_number, tag_number, status, purchase_date, purchase_cost, description)
          VALUES (${asset.name}, ${asset.category}, ${asset.serialNumber}, ${asset.tagNumber}, ${asset.status}, ${asset.purchaseDate}, ${asset.purchaseCost}, ${asset.description})
        `;
      }
    }

  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Utility functions
function generateTagNumber(category: string): string {
  const categoryPrefix = {
    'Laptops': 'LT',
    'Mobile Device': 'MB',
    'Monitor': 'MN',
    'Peripherals': 'PR',
    'Network Equipment': 'NT',
    'Office Equipment': 'OF',
    'Furniture': 'FR',
    'Software': 'SW'
  }[category] || 'AS';

  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9999).toString().padStart(3, '0');
  
  return `WERK-${categoryPrefix}-${random}`;
}

// GET - Fetch all assets
export async function GET() {
  try {
    const database = await getDatabase();
    
    if (database) {
      // Use database (production)
      const result = await database`
        SELECT 
          id, name, category, serial_number, tag_number, status,
          assigned_to, assigned_date, return_date, purchase_date,
          purchase_cost, description, created_date
        FROM assets 
        ORDER BY created_date DESC
      `;

      const assetsFromDb = result.rows.map((asset: any) => ({
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
      }));

      return NextResponse.json(assetsFromDb);
    } else {
      // Use in-memory fallback (development)
      return NextResponse.json(assets);
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new asset
export async function POST(request: NextRequest) {
  try {
    const database = await getDatabase();
    const assetData: NewAssetData = await request.json();
    
    // Validation
    if (!assetData.name || !assetData.category || !assetData.serialNumber) {
      return NextResponse.json(
        { error: 'Name, category, and serial number are required' },
        { status: 400 }
      )
    }

    if (database) {
      // Use database (production)
      // Check if asset with serial number already exists
      const existingAsset = await database`
        SELECT COUNT(*) FROM assets 
        WHERE serial_number = ${assetData.serialNumber}
      `;

      if (existingAsset.rows[0].count > 0) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 409 }
        )
      }

      // Generate unique tag number
      let tagNumber = generateTagNumber(assetData.category);
      let attempts = 0;
      while (attempts < 10) {
        const tagExists = await database`
          SELECT COUNT(*) FROM assets WHERE tag_number = ${tagNumber}
        `;
        if (tagExists.rows[0].count === '0') break;
        tagNumber = generateTagNumber(assetData.category);
        attempts++;
      }

      // Insert new asset
      const result = await database`
        INSERT INTO assets (
          name, category, serial_number, tag_number, status, 
          purchase_date, purchase_cost, description
        )
        VALUES (
          ${assetData.name}, ${assetData.category}, ${assetData.serialNumber}, 
          ${tagNumber}, 'available', ${assetData.purchaseDate || null}, 
          ${assetData.purchaseCost || null}, ${assetData.description || null}
        )
        RETURNING id, name, category, serial_number, tag_number, status, 
                 purchase_date, purchase_cost, description, created_date
      `;

      const newAsset = result.rows[0];
      
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
      });
    } else {
      // Use in-memory fallback (development)
      // Check if asset already exists
      if (assets.some(asset => asset.serialNumber === assetData.serialNumber)) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 409 }
        )
      }

      // Generate unique tag number
      let tagNumber = generateTagNumber(assetData.category);
      while (assets.some(asset => asset.tagNumber === tagNumber)) {
        tagNumber = generateTagNumber(assetData.category);
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
      };

      // Add to assets array
      assets.push(newAsset);

      return NextResponse.json({
        message: 'Asset created successfully',
        asset: newAsset
      });
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
    const database = await getDatabase();
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('id');
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    if (database) {
      // Use database (production)
      // Check if asset exists
      const assetCheck = await database`
        SELECT COUNT(*) FROM assets WHERE id = ${assetId}
      `;

      if (assetCheck.rows[0].count === '0') {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      // Check if asset is currently assigned
      const assignmentCheck = await database`
        SELECT COUNT(*) FROM assets WHERE id = ${assetId} AND status = 'assigned'
      `;

      if (assignmentCheck.rows[0].count > 0) {
        return NextResponse.json(
          { error: 'Cannot delete assigned asset. Please return it first.' },
          { status: 409 }
        )
      }

      // Delete asset
      await database`
        DELETE FROM assets WHERE id = ${assetId}
      `;

      return NextResponse.json({
        message: 'Asset deleted successfully'
      });
    } else {
      // Use in-memory fallback (development)
      const assetIndex = assets.findIndex(asset => asset.id === parseInt(assetId));
      
      if (assetIndex === -1) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      // Check if asset is currently assigned
      if (assets[assetIndex].status === 'assigned') {
        return NextResponse.json(
          { error: 'Cannot delete assigned asset. Please return it first.' },
          { status: 409 }
        )
      }

      // Remove asset
      assets.splice(assetIndex, 1);

      return NextResponse.json({
        message: 'Asset deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
