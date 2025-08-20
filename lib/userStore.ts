import bcrypt from 'bcryptjs'

// Types
export interface User {
  id: number
  username: string
  passwordHash: string
  role: string
  name: string
  email: string
  idNumber: string
  mobileNumber?: string
  createdDate: string
  isActive: boolean
}

// Initial users with proper bcrypt hashes
export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: "Admin.Asset@werk",
    passwordHash: "$2b$10$sQGSnA8WiIQMbHTssZeCTOKfNjVsBkqlB1y/Jxki/RFMoplr.SdP6", // werk@321
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
    passwordHash: "$2b$10$nsJOOWjOTXdxBufoX5ctoOMxLp5HHJLPjYxCburq3DTFWRIfvaO7K", // temp123
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
    passwordHash: "$2b$10$V5TTR/Qs/ozbwIFm3QZWfeK.GwCOqJp.YpJyyVzweK2RQN2p2obSe", // temp456
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
    passwordHash: "$2b$10$OAg/XRgL9L/IwvYsmSg.aOVGL9pvAy2ju7S44JiPbnm4axNIUSbkO", // temp789
    role: "staff",
    name: "Mike Johnson",
    email: "mike.johnson@werk.com",
    idNumber: "STF002",
    mobileNumber: "+254700000003",
    createdDate: "2024-02-10T00:00:00.000Z",
    isActive: true,
  },
]

// Global users array - this will be shared across all API routes
let globalUsers: User[] = [...INITIAL_USERS]

// Export functions to manage users
export function getAllUsers(): User[] {
  return globalUsers
}

export function addUser(user: User): void {
  globalUsers.push(user)
}

export function findUserByUsername(username: string): User | undefined {
  return globalUsers.find(u => u.username === username && u.isActive)
}

export function findUserByEmail(email: string): User | undefined {
  return globalUsers.find(u => u.email === email)
}

export function findUserByIdNumber(idNumber: string): User | undefined {
  return globalUsers.find(u => u.idNumber === idNumber)
}

// Utility functions
export function generateUsername(name: string, existingUsernames: string[]): string {
  const nameParts = name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  
  let baseUsername = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}.assets@werk`
  let username = baseUsername
  let counter = 1
  
  while (existingUsernames.includes(username)) {
    username = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}${counter}.assets@werk`
    counter++
  }
  
  return username
}

export function generateSecurePassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
  let password = ""
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n))
  }
  return password
}
