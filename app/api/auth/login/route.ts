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

    console.log('Login attempt for username:', username)
    console.log('Supabase client available:', !!supabase)

    if (supabase) {
      // Try Supabase database first
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      console.log('Supabase query error:', error)
      console.log('User found in Supabase:', !!users)

      if (!error && users) {
        // User found in database
        console.log('Comparing password for user:', users.username)
        const isValidPassword = await bcrypt.compare(password, users.password_hash)
        console.log('Password valid:', isValidPassword)
        
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
      console.log('Falling back to in-memory storage')
      const memoryUser = findUserByUsername(username)
      console.log('User found in memory:', !!memoryUser)
      
      if (memoryUser) {
        const isValidPassword = await bcrypt.compare(password, memoryUser.passwordHash)
        console.log('Memory user password valid:', isValidPassword)
        
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
      console.log('Using in-memory storage fallback')
      const user = findUserByUsername(username)
      console.log('User found in memory (fallback):', !!user)
      
      if (user) {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        console.log('Memory user password valid (fallback):', isValidPassword)
        
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
