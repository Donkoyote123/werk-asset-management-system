import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseClient } from '@/lib/database'
import { findUserByUsername } from '@/lib/userStore'

export async function GET() {
  try {
    const testUsername = "Admin.Asset@werk"
    const testPassword = "werk@321"
    
    const supabase = getSupabaseClient()
    const response = {
      supabaseAvailable: !!supabase,
      tests: {}
    }

    if (supabase) {
      // Test Supabase user
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', testUsername)
        .single()

      response.tests.supabase = {
        error: error?.message || null,
        userFound: !!users,
        username: users?.username || null,
        hasPasswordHash: !!users?.password_hash
      }

      if (users?.password_hash) {
        const isValidPassword = await bcrypt.compare(testPassword, users.password_hash)
        response.tests.supabase.passwordValid = isValidPassword
      }
    }

    // Test in-memory user
    const memoryUser = findUserByUsername(testUsername)
    response.tests.memory = {
      userFound: !!memoryUser,
      username: memoryUser?.username || null,
      hasPasswordHash: !!memoryUser?.passwordHash
    }

    if (memoryUser?.passwordHash) {
      const isValidPassword = await bcrypt.compare(testPassword, memoryUser.passwordHash)
      response.tests.memory.passwordValid = isValidPassword
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
