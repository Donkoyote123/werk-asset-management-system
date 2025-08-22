import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseClient } from '@/lib/database'
import { 
  getAllUsers, 
  addUser, 
  findUserByEmail, 
  findUserByIdNumber,
  generateUsername,
  generateSecurePassword,
  type User 
} from '../../../lib/userStore'

interface NewUserData {
  name: string
  email: string
  idNumber: string
  role: string
  mobileNumber?: string
}

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Try Supabase first
      const { data: usersFromDb, error } = await supabase
        .from('users')
        .select('id, username, name, email, role, id_number, mobile_number, created_date, is_active')
        .eq('is_active', true)
        .order('created_date', { ascending: false })

      if (!error && usersFromDb) {
        // Transform database format to match frontend expectations
        const transformedUsers = usersFromDb.map((user: any) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          idNumber: user.id_number,
          mobileNumber: user.mobile_number,
          createdDate: user.created_date,
          isActive: user.is_active
        }))

        return NextResponse.json(transformedUsers)
      }
    }
    
    // Fallback to in-memory storage
    const users = getAllUsers();
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error)
    
    // Fallback to in-memory storage on error
    const users = getAllUsers();
    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    
    return NextResponse.json(safeUsers);
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const userData: NewUserData = await request.json()
    
    // Validation
    if (!userData.name || !userData.email || !userData.idNumber || !userData.role) {
      return NextResponse.json(
        { error: 'Name, email, ID number, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists (using shared store)
    if (findUserByEmail(userData.email) || findUserByIdNumber(userData.idNumber)) {
      return NextResponse.json(
        { error: 'User with this email or ID number already exists' },
        { status: 409 }
      )
    }

    // Get existing usernames for uniqueness check
    const existingUsers = getAllUsers();
    const usernames = existingUsers.map(user => user.username);

    // Generate username and password
    const username = generateUsername(userData.name, usernames);
    const plainPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Create new user
    const newUser: User = {
      id: Date.now(),
      username,
      passwordHash,
      name: userData.name,
      email: userData.email,
      idNumber: userData.idNumber,
      role: userData.role,
      mobileNumber: userData.mobileNumber,
      createdDate: new Date().toISOString(),
      isActive: true,
    };

    const supabase = getSupabaseClient()
    
    if (supabase) {
      // Try to save to Supabase first
      const { data: dbUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: newUser.username,
          password_hash: newUser.passwordHash,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          id_number: newUser.idNumber,
          mobile_number: newUser.mobileNumber,
          is_active: newUser.isActive
        })
        .select()
        .single()

      if (!insertError && dbUser) {
        // Successfully saved to database
        const { password_hash, ...safeUser } = dbUser
        const transformedUser = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          idNumber: dbUser.id_number,
          mobileNumber: dbUser.mobile_number,
          createdDate: dbUser.created_date,
          isActive: dbUser.is_active
        }
        
        return NextResponse.json({
          message: 'User created successfully',
          user: transformedUser,
          credentials: {
            username: username,
            password: plainPassword
          }
        });
      } else {
        console.error('Error saving to Supabase:', insertError)
      }
    }

    // Fallback to in-memory storage
    addUser(newUser);

    // Return success with credentials
    const { passwordHash: _, ...safeUser } = newUser;
    
    return NextResponse.json({
      message: 'User created successfully',
      user: safeUser,
      credentials: {
        username: username,
        password: plainPassword
      }
    });
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Reset user password
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new password and hash it
    const newPassword = generateSecurePassword();
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user's password (modify the original array)
    users[userIndex].passwordHash = newPasswordHash;

    return NextResponse.json({
      message: 'Password reset successfully',
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
