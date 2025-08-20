import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByUsername } from '../../../../lib/userStore'

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

// In-memory fallback for development
const INITIAL_USERS = [
  {
    id: 1,
    username: "Admin.Asset@werk",
    passwordHash: "$2b$10$Cj3yB3cBiqNMph640SewBOKti4Ptkso9WCbA3u5VI6w/L8OqdCAoy", // werk@321
    role: "admin",
    name: "System Administrator",
    email: "admin@werk.com",
    idNumber: "ADM001",
    mobileNumber: "+254700000000",
    createdDate: "2024-01-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: 2,
    username: "DK.assets@werk",
    passwordHash: "$2b$10$n8mR.kRZwLkD4rjhoD9G0uAAe9PXAFcuLnnK9UK4i92e/1IdvMitu", // temp123
    role: "manager",
    name: "Don Kelvin",
    email: "don.kelvin@werk.com",
    idNumber: "MGR001",
    mobileNumber: "+254700000001",
    createdDate: "2024-01-15T00:00:00.000Z",
    isActive: true,
  },
  {
    id: 3,
    username: "JS.assets@werk",
    passwordHash: "$2b$10$A4eyw326O7WJtjH4keCk4OGdPV7/2YcUdykpoG.x8ORDgTfVGivA6", // temp456
    role: "staff",
    name: "Jane Smith",
    email: "jane.smith@werk.com",
    idNumber: "STF001",
    mobileNumber: "+254700000002",
    createdDate: "2024-02-01T00:00:00.000Z",
    isActive: true,
  },
  {
    id: 4,
    username: "MJ.assets@werk",
    passwordHash: "$2b$10$9.CkCxhTqzGzDRtcROiK6erAH9SYu4VzW74ybW9DFZhpiURRJ7avm", // temp789
    role: "staff",
    name: "Mike Johnson",
    email: "mike.johnson@werk.com",
    idNumber: "STF002",
    mobileNumber: "+254700000003",
    createdDate: "2024-02-10T00:00:00.000Z",
    isActive: true,
  },
]

// Note: We now use shared users from the users API route

async function initDatabase() {
  if (!sql) return;
  
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        id_number VARCHAR(50) UNIQUE NOT NULL,
        mobile_number VARCHAR(20),
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;

    // Insert default admin user if not exists
    const adminExists = await sql`
      SELECT COUNT(*) FROM users WHERE username = 'Admin.Asset@werk'
    `;
    
    if (adminExists.rows[0].count === '0') {
      const adminPasswordHash = await bcrypt.hash('werk@321', 10);
      await sql`
        INSERT INTO users (username, password_hash, role, name, email, id_number, mobile_number)
        VALUES (
          'Admin.Asset@werk',
          ${adminPasswordHash},
          'admin',
          'System Administrator',
          'admin@werk.com',
          'ADM001',
          '+254700000000'
        )
      `;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const database = await getDatabase();
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (database) {
      // Use database (production)
      const result = await database`
        SELECT * FROM users 
        WHERE username = ${username} AND is_active = true
      `;

      const user = result.rows[0];

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Return user data (without password hash)
      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          idNumber: user.id_number,
          mobileNumber: user.mobile_number,
          createdDate: user.created_date,
        }
      });
    } else {
      // Use in-memory fallback (development) with shared store
      const user = findUserByUsername(username);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Return user data (without password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword
      });
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
