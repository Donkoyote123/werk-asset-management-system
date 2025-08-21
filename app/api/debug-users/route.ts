import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '../../../lib/userStore'

export async function GET(request: NextRequest) {
  try {
    const users = getAllUsers();
    
    // Return users without password hashes for security but include usernames
    const safeUsers = users.map(({ passwordHash, ...user }) => ({
      ...user,
      hasPasswordHash: !!passwordHash,
      passwordHashLength: passwordHash ? passwordHash.length : 0,
      passwordHashStart: passwordHash ? passwordHash.substring(0, 10) + '...' : 'none'
    }));
    
    return NextResponse.json({
      totalUsers: users.length,
      users: safeUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching debug users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
