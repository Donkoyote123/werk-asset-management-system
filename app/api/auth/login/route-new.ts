import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql, initializeDatabase } from '../../../../lib/database'
import { findUserByUsername } from '../../../../lib/userStore'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Try database first, fallback to in-memory
    const hasDatabase = await initializeDatabase()

    if (hasDatabase) {
      // Use database (production)
      const result = await sql`
        SELECT * FROM users 
        WHERE username = ${username} AND is_active = true
      `

      const user = result.rows[0]

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash)

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
      })
    } else {
      // Use in-memory fallback (development) with shared store
      const user = findUserByUsername(username)

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Return user data (without password hash)
      const { passwordHash, ...userWithoutPassword } = user
      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword
      })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
