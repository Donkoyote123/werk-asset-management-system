import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseClient } from '@/lib/database'
import { findUserByUsername } from '@/lib/userStore'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    if (supabase) {
      // Try Supabase database first
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (!error && users) {
        // User found in database
        const isValidPassword = await bcrypt.compare(password, users.password_hash)
        
        if (isValidPassword) {
          const userData = {
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            role: users.role,
            idNumber: users.id_number,
            mobileNumber: users.mobile_number
          }
          
          return NextResponse.json({
            message: 'Login successful',
            user: userData
          })
        }
      }
      
      // If not found in database or password incorrect, fall back to in-memory
      const memoryUser = findUserByUsername(username)
      
      if (memoryUser) {
        const isValidPassword = await bcrypt.compare(password, memoryUser.passwordHash)
        
        if (isValidPassword) {
          const { passwordHash, ...userWithoutPassword } = memoryUser
          return NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword
          })
        }
      }
    } else {
      // Use in-memory storage fallback
      const user = findUserByUsername(username)
      
      if (user) {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        
        if (isValidPassword) {
          const { passwordHash, ...userWithoutPassword } = user
          return NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword
          })
        }
      }
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
