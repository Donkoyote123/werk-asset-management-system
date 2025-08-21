import { sql } from '@vercel/postgres'

// Database connection utility
export async function initializeDatabase() {
  try {
    // Check if we have a database connection
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      console.warn('No database connection string found. Using in-memory storage.')
      return false
    }

    // Test the connection
    await sql`SELECT 1`
    
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Run database migrations/initialization
export async function runMigrations() {
  try {
    console.log('Running database migrations...')
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        id_number VARCHAR(50) UNIQUE NOT NULL,
        mobile_number VARCHAR(20),
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create assets table
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        serial_number VARCHAR(100) UNIQUE,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        current_value DECIMAL(10,2),
        condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
        location VARCHAR(100),
        description TEXT,
        assigned_to INTEGER REFERENCES users(id),
        assigned_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create asset assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS asset_assignments (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        returned_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        assigned_by INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'transferred'))
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_asset_id ON asset_assignments(asset_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON asset_assignments(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_assignments_status ON asset_assignments(status)`

    // Insert default admin user if not exists
    const adminExists = await sql`
      SELECT COUNT(*) FROM users WHERE username = 'Admin.Asset@werk'
    `
    
    if (adminExists.rows[0].count === '0') {
      await sql`
        INSERT INTO users (username, password_hash, role, name, email, id_number, mobile_number) 
        VALUES (
          'Admin.Asset@werk',
          '$2b$10$sQGSnA8WiIQMbHTssZeCTOKfNjVsBkqlB1y/Jxki/RFMoplr.SdP6',
          'admin',
          'System Administrator',
          'admin@werk.com',
          'ADM001',
          '+254700000000'
        )
      `
      console.log('Default admin user created')
    }

    // Insert sample users if not exist
    const userCount = await sql`SELECT COUNT(*) FROM users`
    if (parseInt(userCount.rows[0].count) === 1) {
      await sql`
        INSERT INTO users (username, password_hash, role, name, email, id_number, mobile_number) 
        VALUES 
          ('DK.assets@werk', '$2b$10$nsJOOWjOTXdxBufoX5ctoOMxLp5HHJLPjYxCburq3DTFWRIfvaO7K', 'manager', 'Don Kelvin', 'don.kelvin@werk.com', 'MGR001', '+254700000001'),
          ('JS.assets@werk', '$2b$10$V5TTR/Qs/ozbwIFm3QZWfeK.GwCOqJp.YpJyyVzweK2RQN2p2obSe', 'staff', 'Jane Smith', 'jane.smith@werk.com', 'STF001', '+254700000002'),
          ('MJ.assets@werk', '$2b$10$OAg/XRgL9L/IwvYsmSg.aOVGL9pvAy2ju7S44JiPbnm4axNIUSbkO', 'staff', 'Mike Johnson', 'mike.johnson@werk.com', 'STF002', '+254700000003')
        ON CONFLICT (username) DO NOTHING
      `
      console.log('Sample users created')
    }

    // Insert sample assets if none exist
    const assetCount = await sql`SELECT COUNT(*) FROM assets`
    if (parseInt(assetCount.rows[0].count) === 0) {
      await sql`
        INSERT INTO assets (name, category, serial_number, purchase_date, purchase_price, current_value, location, description, status) 
        VALUES 
          ('Dell Laptop XPS 15', 'Computer', 'DL001XPS15', '2024-01-15', 1500.00, 1200.00, 'Office Floor 1', 'High-performance laptop for development work', 'available'),
          ('HP Printer LaserJet', 'Printer', 'HP001LJ2024', '2024-02-01', 800.00, 650.00, 'Office Floor 2', 'Color laser printer for office documents', 'available'),
          ('Office Desk Oak', 'Furniture', 'DESK001OAK', '2024-01-10', 350.00, 300.00, 'Office Floor 1', 'Solid oak office desk with drawers', 'available'),
          ('iPhone 15 Pro', 'Mobile Device', 'IPH15P001', '2024-03-01', 999.00, 850.00, 'IT Department', 'Company mobile phone', 'available')
      `
      console.log('Sample assets created')
    }

    console.log('Database migrations completed successfully')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

export { sql }
