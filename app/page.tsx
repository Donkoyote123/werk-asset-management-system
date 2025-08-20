"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, Shield, Users, Package, Search, CheckCircle, AlertCircle, Plus, Download } from "lucide-react"

const INITIAL_USERS = [
  {
    username: "Admin.Asset@werk",
    password: "werk@321",
    role: "admin",
    name: "System Administrator",
    id: 1,
    email: "admin@werk.com",
    idNumber: "ADM001",
    createdDate: "2024-01-01",
  },
  {
    username: "DK.assets@werk",
    password: "temp123",
    role: "manager",
    name: "Don Kelvin",
    id: 2,
    email: "don.kelvin@werk.com",
    idNumber: "MGR001",
    createdDate: "2024-01-15",
  },
  {
    username: "JS.assets@werk",
    password: "temp456",
    role: "staff",
    name: "Jane Smith",
    id: 3,
    email: "jane.smith@werk.com",
    idNumber: "STF001",
    createdDate: "2024-02-01",
  },
  {
    username: "MJ.assets@werk",
    password: "temp789",
    role: "staff",
    name: "Mike Johnson",
    id: 4,
    email: "mike.johnson@werk.com",
    idNumber: "STF002",
    createdDate: "2024-02-15",
  },
]

const INITIAL_ASSETS = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    category: "Laptop",
    serialNumber: "MBP2023001",
    tagNumber: "WERK-LT-001",
    status: "assigned",
    assignedTo: "Jane Smith",
    assignedDate: "2024-01-15",
    returnDate: null,
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    category: "Mobile",
    serialNumber: "IP15P001",
    tagNumber: "WERK-MB-001",
    status: "assigned",
    assignedTo: "Jane Smith",
    assignedDate: "2024-02-01",
    returnDate: null,
  },
  {
    id: 3,
    name: 'Dell Monitor 27"',
    category: "Monitor",
    serialNumber: "DM27001",
    tagNumber: "WERK-MN-001",
    status: "assigned",
    assignedTo: "Jane Smith",
    assignedDate: "2024-01-20",
    returnDate: null,
  },
  {
    id: 4,
    name: "HP Laptop",
    category: "Laptop",
    serialNumber: "HP2023002",
    tagNumber: "WERK-LT-002",
    status: "available",
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
  },
  {
    id: 5,
    name: "Samsung Monitor",
    category: "Monitor",
    serialNumber: "SM24001",
    tagNumber: "WERK-MN-002",
    status: "available",
    assignedTo: null,
    assignedDate: null,
    returnDate: null,
  },
  {
    id: 6,
    name: "iPad Pro",
    category: "Tablet",
    serialNumber: "IPD2023001",
    tagNumber: "WERK-TB-001",
    status: "assigned",
    assignedTo: "Mike Johnson",
    assignedDate: "2024-02-10",
    returnDate: null,
  },
]

const CATEGORIES = ["Laptop", "Desktop", "Monitor", "Mobile", "Tablet", "Printer", "Accessories", "Other"]

type UserType = {
  username: string
  role: "admin" | "manager" | "staff"
  name: string
  id: number
  email: string
  idNumber: string
  createdDate: string
  password?: string
  departureDate?: string
  mobileNumber?: string
}

type Asset = {
  id: number
  name: string
  category: string
  serialNumber: string
  tagNumber: string
  status: "available" | "assigned" | "maintenance" | "retired"
  assignedTo: string | null
  assignedDate: string | null
  returnDate: string | null
  assignmentCondition?: string
  returnCondition?: string
}

const generateSerialNumber = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `WERK-${timestamp}-${random}`.toUpperCase()
}

interface UserInterface {
  id: string
  name: string
  email: string
  idNumber: string
  mobileNumber: string // Added mobile number field
  username: string
  password: string
  role: "admin" | "manager" | "staff"
  createdDate: string
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS)
  const [assets, setAssets] = useState(INITIAL_ASSETS)
  const [documents, setDocuments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pastUsers, setPastUsers] = useState<UserType[]>([])
  const [userViewTab, setUserViewTab] = useState("current")
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddAssetForm, setShowAddAssetForm] = useState(false)

  const handleRemoveUser = (userId: number) => {
    // Logic to remove user
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("werkUsers", JSON.stringify(updatedUsers))
  }

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const assetsData = await response.json()
        setAssets(assetsData)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  // Add new asset via API
  const handleAddAsset = async (assetData: {
    name: string
    category: string
    serialNumber: string
  }) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      })

      if (response.ok) {
        await fetchAssets() // Refresh the assets list
        return true
      } else {
        const error = await response.json()
        console.error('Error adding asset:', error)
        return false
      }
    } catch (error) {
      console.error('Error adding asset:', error)
      return false
    }
  }

  // Delete asset via API
  const handleDeleteAsset = async (assetId: number) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAssets() // Refresh the assets list
        return true
      } else {
        const error = await response.json()
        console.error('Error deleting asset:', error)
        return false
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      return false
    }
  }

  // Assign asset to user via API
  const handleAssignAssetAPI = async (assetId: number, userId: number, notes?: string) => {
    try {
      const response = await fetch('/api/assets/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          userId,
          assignedBy: user?.name || 'System',
          notes
        }),
      })

      if (response.ok) {
        await fetchAssets() // Refresh the assets list
        return true
      } else {
        const error = await response.json()
        console.error('Error assigning asset:', error)
        return false
      }
    } catch (error) {
      console.error('Error assigning asset:', error)
      return false
    }
  }

  // Return asset via API
  const handleReturnAssetAPI = async (assetId: number, returnCondition?: string, notes?: string) => {
    try {
      const response = await fetch('/api/assets/assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          returnCondition,
          notes
        }),
      })

      if (response.ok) {
        await fetchAssets() // Refresh the assets list
        return true
      } else {
        const error = await response.json()
        console.error('Error returning asset:', error)
        return false
      }
    } catch (error) {
      console.error('Error returning asset:', error)
      return false
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("werkUser")
    const savedPastUsers = localStorage.getItem("werkPastUsers")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }

    // Load data from API instead of localStorage
    fetchUsers()
    fetchAssets()

    if (savedPastUsers) {
      try {
        const parsedPastUsers = JSON.parse(savedPastUsers)
        if (Array.isArray(parsedPastUsers)) {
          setPastUsers(parsedPastUsers)
        }
      } catch (error) {
        console.error("Error parsing saved past users:", error)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsLoggedIn(true)
        localStorage.setItem("werkUser", JSON.stringify(data.user))
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("werkUser")
    setUsername("")
    setPassword("")
    setIsLoggedIn(false)
  }

  const generateUserListPDF = (userList: UserType[], listType: "current" | "past") => {
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()
    const currentDate = new Date().toLocaleDateString()

    // Create PDF content with proper structure for all PDF readers
    const userRows = userList
      .map((user) => {
        const registrationDate = user.createdDate || "N/A"
        const departureDate = listType === "past" && user.departureDate ? user.departureDate : "N/A"

        return `${user.name} | ${user.idNumber} | ${user.email} | ${user.username} | ${user.role} | ${user.mobileNumber || "N/A"} | ${registrationDate} | ${departureDate}`
      })
      .join("\n")

    const pdfContent = `WOMEN EDUCATIONAL RESEARCHERS OF KENYA
WERK ASSET MANAGEMENT SYSTEM
${listType.toUpperCase()} USERS REPORT

Report Generated: ${timestamp}
Date: ${currentDate}
Serial Number: ${serialNumber}
Total Users: ${userList.length}

USER DETAILS:
Name | ID Number | Email | Username | Role | Mobile | Registered | ${listType === "past" ? "Departed" : "Status"}
${"=".repeat(120)}
${userRows}

${"=".repeat(120)}
End of Report

This document is system generated and verifiable through serial number: ${serialNumber}
©2025. Women Educational Researchers of Kenya. All Rights Reserved.
System developed by Don Kelvin | 0759954921`

    // Store document for verification
    const doc = {
      id: Date.now(),
      type: "user_list_report",
      serialNumber,
      listType,
      timestamp,
      content: `${listType.toUpperCase()} Users Report - ${userList.length} users`,
    }
    setDocuments((prev) => [...prev, doc])

    // Generate proper PDF with enhanced compatibility
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${pdfContent.length + 200}
>>
stream
BT
/F1 10 Tf
50 750 Td
${pdfContent
  .split("\n")
  .map((line) => `(${line.replace(/[()\\]/g, "\\$&")}) Tj 0 -12 Td`)
  .join("\n")}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Courier
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000${(400 + pdfContent.length).toString().padStart(3, "0")} 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${450 + pdfContent.length}
%%EOF`

    const blob = new Blob([pdfHeader], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `WERK-${listType}-users-report-${serialNumber}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateSecurePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
    let password = ""
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n))
    }
    return password
  }

  const handleAddUser = async (userData: {
    name: string
    email: string
    idNumber: string
    role: "manager" | "staff"
    mobileNumber: string
  }) => {
    if (!userData.name || !userData.email || !userData.idNumber || !userData.mobileNumber) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          idNumber: userData.idNumber,
          role: userData.role,
          mobileNumber: userData.mobileNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh users list
        await fetchUsers()

        // Generate user credentials receipt
        generateUserCredentialsReceipt(result.user, result.credentials.password)

        setShowAddUser(false)
        alert(`User created successfully! Username: ${result.credentials.username}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert("Network error. Please try again.")
    }
  }

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh users list
        await fetchUsers()

        // Find the user and generate new credentials receipt
        const user = users.find((u) => u.id === userId)
        if (user) {
          generateUserCredentialsReceipt(user, result.newPassword)
        }

        alert(`Password reset successfully! New password: ${result.newPassword}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert("Network error. Please try again.")
    }
  }

  const generateUserCredentialsReceipt = (user: any, generatedPassword: string) => {
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()

    const doc = {
      id: Date.now(),
      type: "user_credentials",
      serialNumber,
      userId: user.id,
      userName: user.name,
      timestamp,
      content: `User Credentials - ${user.name}`,
    }

    setDocuments((prev) => [...prev, doc])

    const credentialsContent = `WERK ASSET MANAGEMENT SYSTEM
User Account Credentials

Serial Number: ${serialNumber}
Date: ${timestamp}

CONFIDENTIAL - HANDLE WITH CARE

Staff Details:
Name: ${user.name}
ID Number: ${user.idNumber}
Official Email: ${user.email}
Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}

System Login Details:
Username: ${user.username}
Password: ${generatedPassword}

IMPORTANT SECURITY NOTICE:
- Keep these credentials secure
- Change password after first login
- This document is verifiable through serial number: ${serialNumber}

Generated by: WERK Asset Management System`

    generatePDFContent(credentialsContent, `user-credentials-${user.username}-${serialNumber}.pdf`)
  }

  const generatePDFContent = (content: string, filename: string) => {
    // Create proper PDF structure for better compatibility
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
${content
  .split("\n")
  .map((line, index) => `(${line}) Tj 0 -15 Td`)
  .join("\n")}
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`

    const blob = new Blob([pdfHeader], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoggedIn && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        users={users}
        setUsers={setUsers}
        assets={assets}
        setAssets={setAssets}
        documents={documents}
        setDocuments={setDocuments}
        requests={requests}
        setRequests={setRequests}
        pastUsers={pastUsers}
        setPastUsers={setPastUsers}
        userViewTab={userViewTab}
        setUserViewTab={setUserViewTab}
        showAddUser={showAddUser}
        setShowAddUser={setShowAddUser}
        showAddAssetForm={showAddAssetForm}
        setShowAddAssetForm={setShowAddAssetForm}
        generateUserListPDF={generateUserListPDF}
        handleAddUser={handleAddUser}
        generatePDFContent={generatePDFContent}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4d72d] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="w-10 h-10 text-[#a4d72d]" />
              <span className="text-2xl font-bold text-gray-900">WERK</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-700">Asset Management System</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-[#a4d72d] hover:bg-[#8bc224]">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-600">System developed by Don Kelvin | 0759954921</footer>
    </div>
  )
}

function Dashboard({
  user,
  onLogout,
  users,
  setUsers,
  assets,
  setAssets,
  documents,
  setDocuments,
  requests,
  setRequests,
  pastUsers,
  setPastUsers,
  userViewTab,
  setUserViewTab,
  showAddUser,
  setShowAddUser,
  showAddAssetForm,
  setShowAddAssetForm,
  generateUserListPDF,
  handleAddUser,
  generatePDFContent,
}: {
  user: UserType
  onLogout: () => void
  users: UserType[]
  setUsers: (users: UserType[]) => void
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  documents: any[]
  setDocuments: (documents: any[]) => void
  requests: any[]
  setRequests: (requests: any[]) => void
  pastUsers: UserType[]
  setPastUsers: (pastUsers: UserType[]) => void
  userViewTab: string
  setUserViewTab: (tab: string) => void
  showAddUser: boolean
  setShowAddUser: (show: boolean) => void
  showAddAssetForm: boolean
  setShowAddAssetForm: (show: boolean) => void
  generateUserListPDF: (userList: UserType[], listType: "current" | "past") => void
  handleAddUser: (userData: {
    name: string
    email: string
    idNumber: string
    role: "manager" | "staff"
    mobileNumber: string
  }) => void
  generatePDFContent: (content: string, filename: string) => void
}) {
  const [activeTab, setActiveTab] = useState("dashboard")

  const navigation = {
    admin: [
      { id: "dashboard", label: "Dashboard", icon: Package },
      { id: "users", label: "User Management", icon: Users },
      { id: "assets", label: "Asset Management", icon: Package },
      { id: "verification", label: "Document Verification", icon: Shield }, // Added verification tab
      { id: "reports", label: "Reports", icon: Shield },
    ],
    manager: [
      { id: "dashboard", label: "Dashboard", icon: Package },
      { id: "assets", label: "Asset Management", icon: Package },
      { id: "requests", label: "Request Review", icon: Users }, // Changed from assignments to request review
      { id: "verification", label: "Document Verification", icon: Shield }, // Added verification tab for managers
      { id: "reports", label: "Reports", icon: Shield },
    ],
    staff: [
      { id: "dashboard", label: "Request Assets", icon: Package }, // Updated label
      { id: "profile", label: "Profile", icon: Users },
    ],
  }

  const currentNav = navigation[user.role]

  useEffect(() => {
    localStorage.setItem("werkUsers", JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem("werkPastUsers", JSON.stringify(pastUsers))
  }, [pastUsers])

  useEffect(() => {
    localStorage.setItem("werkAssets", JSON.stringify(assets))
  }, [assets])

  const handleRemoveUser = (userId: number) => {
    const userToRemove = users.find((user) => user.id === userId)
    if (userToRemove) {
      // Move user to past users with departure date
      const updatedUser = {
        ...userToRemove,
        departureDate: new Date().toISOString().split("T")[0],
      }
      setPastUsers([...pastUsers, updatedUser])

      // Remove from current users
      const updatedUsers = users.filter((user) => user.id !== userId)
      setUsers(updatedUsers)
      localStorage.setItem("werkUsers", JSON.stringify(updatedUsers))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#a4d72d]" />
              <span className="text-xl font-bold text-gray-900">WERK</span>
            </div>
            <div className="hidden md:block text-sm text-gray-500">Asset Management System</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <Button variant="outline" onClick={onLogout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              {currentNav.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-green-50 text-[#a4d72d] border-r-2 border-[#a4d72d]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <DashboardContent
            user={user}
            activeTab={activeTab}
            users={users}
            setUsers={setUsers}
            assets={assets}
            setAssets={setAssets}
            documents={documents}
            setDocuments={setDocuments}
            showAddAsset={showAddAssetForm}
            setShowAddAsset={setShowAddAssetForm}
            requests={requests}
            setRequests={setRequests}
            pastUsers={pastUsers}
            setPastUsers={setPastUsers}
            userViewTab={userViewTab}
            setUserViewTab={setUserViewTab}
            generateUserListPDF={generateUserListPDF}
            handleRemoveUser={handleRemoveUser}
            showAddUser={showAddUser}
            setShowAddUser={setShowAddUser}
            handleAddUser={handleAddUser}
            generatePDFContent={generatePDFContent}
          />
        </main>
      </div>

      <footer className="bg-white border-t px-6 py-4 text-center text-sm text-gray-600">
        System developed by Don Kelvin | 0759954921
      </footer>
    </div>
  )
}

function DashboardContent({
  user,
  activeTab,
  users,
  setUsers,
  assets,
  setAssets,
  documents,
  setDocuments,
  showAddAsset,
  setShowAddAsset,
  requests,
  setRequests,
  pastUsers,
  setPastUsers,
  userViewTab,
  setUserViewTab,
  generateUserListPDF,
  handleRemoveUser,
  showAddUser,
  setShowAddUser,
  handleAddUser,
  generatePDFContent,
}: {
  user: UserType
  activeTab: string
  users: UserType[]
  setUsers: (users: UserType[]) => void
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  documents: any[]
  setDocuments: (documents: any[]) => void
  showAddAsset: boolean
  setShowAddAsset: (showAddAsset: boolean) => void
  requests: any[]
  setRequests: (requests: any[]) => void
  pastUsers: UserType[]
  setPastUsers: (pastUsers: UserType[]) => void
  userViewTab: string
  setUserViewTab: (tab: string) => void
  generateUserListPDF: (userList: UserType[], listType: "current" | "past") => void
  handleRemoveUser: (userId: number) => void
  showAddUser: boolean
  setShowAddUser: (show: boolean) => void
  handleAddUser: (userData: {
    name: string
    email: string
    idNumber: string
    role: "manager" | "staff"
    mobileNumber: string
  }) => void
  generatePDFContent: (content: string, filename: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const [verificationSearch, setVerificationSearch] = useState("")
  const [staffActiveTab, setStaffActiveTab] = useState("request-items")

  const generateUserCredentialsReceipt = (user: any, generatedPassword: string) => {
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()

    const doc = {
      id: Date.now(),
      type: "user_credentials",
      serialNumber,
      userId: user.id,
      userName: user.name,
      timestamp,
      content: `User Credentials - ${user.name}`,
    }

    setDocuments((prev) => [...prev, doc])

    const credentialsContent = `WERK ASSET MANAGEMENT SYSTEM
User Account Credentials

Serial Number: ${serialNumber}
Date: ${timestamp}

CONFIDENTIAL - HANDLE WITH CARE

Staff Details:
Name: ${user.name}
ID Number: ${user.idNumber}
Official Email: ${user.email}
Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}

System Login Details:
Username: ${user.username}
Password: ${generatedPassword}

IMPORTANT SECURITY NOTICE:
- Keep these credentials secure
- Change password after first login
- This document is verifiable through serial number: ${serialNumber}

Generated by: WERK Asset Management System`

    generatePDFContent(credentialsContent, `user-credentials-${user.username}-${serialNumber}.pdf`)
  }

  const generateAssignmentReceipt = (asset: any, staffName: string, condition: string) => {
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()

    const doc = {
      id: Date.now(),
      type: "assignment_receipt",
      serialNumber,
      assetId: asset.id,
      assetName: asset.name,
      staffName,
      assignmentDate: timestamp,
      condition,
      content: `Asset Assignment - ${asset.name}`,
    }

    setDocuments((prev) => [...prev, doc])

    const receiptContent = `WERK ASSET MANAGEMENT SYSTEM
Asset Assignment Receipt

Serial Number: ${serialNumber}
Date: ${timestamp}

Staff Details:
Name: ${staffName}

Asset Details:
Asset Name: ${asset.name}
Category: ${asset.category}
Serial Number: ${asset.serialNumber}
Tag Number: ${asset.tagNumber}
Condition at Assignment: ${condition}

This receipt confirms the assignment of the above asset.
Staff is responsible for the asset until returned.
Document is verifiable through serial number: ${serialNumber}

Assigned by: Asset Manager`

    generatePDFContent(receiptContent, `assignment-receipt-${asset.tagNumber}-${serialNumber}.pdf`)
  }

  const handleRequestAsset = (assetId: number) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return

    const newRequest = {
      id: Date.now(),
      assetId: asset.id,
      assetName: asset.name,
      category: asset.category,
      requestedBy: user.name,
      requestedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      notes: "",
    }

    setRequests([...requests, newRequest])
  }

  const handleAssignAsset = (assetId: number, staffName: string, condition = "Good") => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return

    setAssets(
      assets.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: "assigned",
              assignedTo: staffName,
              assignedDate: new Date().toISOString().split("T")[0],
              assignmentCondition: condition,
            }
          : a,
      ),
    )

    // Generate assignment receipt
    generateAssignmentReceipt(asset, staffName, condition)
  }

  const handleApproveRequest = (requestId: number, condition = "Good") => {
    const request = requests.find((r) => r.id === requestId)
    if (!request) return

    // Assign the asset with condition
    handleAssignAsset(request.assetId, request.requestedBy, condition)

    // Update request status
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r)))
  }

  const handleRejectRequest = (requestId: number, reason = "") => {
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "rejected", rejectionReason: reason } : r)))
  }

  // Calculate stats
  const stats = {
    totalAssets: assets.length,
    assignedAssets: assets.filter((a) => a.status === "assigned").length,
    availableAssets: assets.filter((a) => a.status === "available").length,
    totalUsers: users.length,
    categories: CATEGORIES.length,
  }

  const myAssets = assets.filter((asset) => asset.assignedTo === user.name)

  const generateReturnReceipt = (asset: any, staffName: string, returnCondition: string) => {
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()

    const doc = {
      id: Date.now(),
      type: "return_receipt",
      serialNumber,
      assetId: asset.id,
      assetName: asset.name,
      staffName,
      returnDate: timestamp,
      returnCondition,
      content: `Asset Return Receipt - ${asset.name}`,
    }

    setDocuments((prev) => [...prev, doc])

    const receiptContent = `WERK ASSET MANAGEMENT SYSTEM
Asset Return Clearance Receipt

Serial Number: ${serialNumber}
Date: ${timestamp}

Staff Details:
Name: ${staffName}

Asset Details:
Asset Name: ${asset.name}
Category: ${asset.category}
Serial Number: ${asset.serialNumber}
Tag Number: ${asset.tagNumber}
Condition at Assignment: ${asset.assignmentCondition || "Good"}
Condition at Return: ${returnCondition}

CLEARANCE CONFIRMATION:
This receipt confirms the successful return of the above asset.
Staff has been cleared of responsibility for this asset.
Document is verifiable through serial number: ${serialNumber}

©2025. Women Educational Researchers of Kenya. All Rights Reserved.
Processed by: Asset Manager`

    generatePDFContent(receiptContent, `clearance-receipt-${asset.tagNumber}-${serialNumber}.pdf`)
  }

  const handleReturnAsset = (assetId: number, returnCondition = "Good") => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset || !asset.assignedTo) return

    // Generate return receipt
    const serialNumber = generateSerialNumber()
    const timestamp = new Date().toLocaleString()

    const doc = {
      id: Date.now(),
      type: "return_receipt",
      serialNumber,
      assetId: asset.id,
      assetName: asset.name,
      staffName: asset.assignedTo,
      returnDate: timestamp,
      returnCondition,
      content: `Asset Return Receipt - ${asset.name}`,
    }

    setDocuments((prev) => [...prev, doc])

    const receiptContent = `WERK ASSET MANAGEMENT SYSTEM
Asset Return Clearance Receipt

Serial Number: ${serialNumber}
Date: ${timestamp}

Staff Details:
Name: ${asset.assignedTo}

Asset Details:
Asset Name: ${asset.name}
Category: ${asset.category}
Serial Number: ${asset.serialNumber}
Tag Number: ${asset.tagNumber}
Condition at Assignment: ${asset.assignmentCondition || "Good"}
Condition at Return: ${returnCondition}

CLEARANCE CONFIRMATION:
This receipt confirms the successful return of the above asset.
Staff has been cleared of responsibility for this asset.
Document is verifiable through serial number: ${serialNumber}

©2025. Women Educational Researchers of Kenya. All Rights Reserved.
Processed by: Asset Manager`

    generatePDFContent(receiptContent, `clearance-receipt-${asset.tagNumber}-${serialNumber}.pdf`)

    // Update asset status
    setAssets(
      assets.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: "available",
              assignedTo: "",
              assignedDate: "",
              returnDate: new Date().toISOString().split("T")[0],
              returnCondition,
            }
          : a,
      ),
    )
  }

  const DocumentVerification = () => {
    const [verificationResult, setVerificationResult] = useState<any>(null)
    const [isVerifying, setIsVerifying] = useState(false)

    const handleVerification = () => {
      setIsVerifying(true)
      setTimeout(() => {
        const filteredDocs = documents.filter(
          (doc) =>
            doc.serialNumber.toLowerCase().includes(verificationSearch.toLowerCase()) ||
            doc.userName?.toLowerCase().includes(verificationSearch.toLowerCase()) ||
            doc.staffName?.toLowerCase().includes(verificationSearch.toLowerCase()),
        )
        setVerificationResult(filteredDocs)
        setIsVerifying(false)
      }, 1000)
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-600">Verify system-generated documents by serial number</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Documents</CardTitle>
            <CardDescription>Enter serial number or staff name to verify documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter serial number or staff name..."
                value={verificationSearch}
                onChange={(e) => setVerificationSearch(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleVerification} disabled={isVerifying || !verificationSearch.trim()}>
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {verificationResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Results ({verificationResult.length} found)</h3>
            {verificationResult.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-red-500 mb-2">
                    <AlertCircle className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-gray-500">No documents found with the provided search criteria</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please check the serial number or staff name and try again
                  </p>
                </CardContent>
              </Card>
            ) : (
              verificationResult.map((doc: any) => (
                <Card key={doc.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-green-800">{doc.content}</CardTitle>
                        <CardDescription className="text-green-600">Serial: {doc.serialNumber}</CardDescription>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <strong>Document Type:</strong> {doc.type.replace("_", " ").toUpperCase()}
                      </div>
                      <div>
                        <strong>Generated Date:</strong> {doc.generatedDate || doc.returnDate}
                      </div>
                      {doc.userName && (
                        <div>
                          <strong>User:</strong> {doc.userName}
                        </div>
                      )}
                      {doc.staffName && (
                        <div>
                          <strong>Staff Member:</strong> {doc.staffName}
                        </div>
                      )}
                      {doc.assetName && (
                        <div>
                          <strong>Asset:</strong> {doc.assetName}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeTab === "dashboard" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Asset Management System</p>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage users and their credentials</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddUser(true)}
                className="px-4 py-2 bg-[#a4d72d] text-white rounded-lg hover:bg-[#8bc226] transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add User
              </button>
              <button
                onClick={() => generateUserListPDF(users, "current")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download Current Users PDF
              </button>
              <button
                onClick={() => generateUserListPDF(pastUsers, "past")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Download Past Users PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b">
              {/* Add profile tab to staff navigation and fix receipt download functionality */}
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setStaffActiveTab("request-items")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "request-items"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Request Items
                </button>
                <button
                  onClick={() => setStaffActiveTab("my-assets")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "my-assets"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Assets
                </button>
                <button
                  onClick={() => setStaffActiveTab("my-receipts")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "my-receipts"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Receipts
                </button>
                <button
                  onClick={() => setStaffActiveTab("profile")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "profile"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>

            <div className="p-6">
              {userViewTab === "current" ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Users</h3>
                  <div className="grid gap-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">
                            {user.email} • {user.role}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mobile: {user.mobileNumber} • Registered: {user.createdDate || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => generateUserCredentialsReceipt(user, "newPassword123")}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Past Users</h3>
                  <div className="grid gap-4">
                    {pastUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">
                            {user.email} • {user.role}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mobile: {user.mobileNumber} • Registered: {user.createdDate || "N/A"} • Left:{" "}
                            {user.departureDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "assets" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Manage assets and their assignments</p>
        </div>
      )}

      {activeTab === "verification" && <DocumentVerification />}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Generate comprehensive system reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#a4d72d]">{assets.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Assigned Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {assets.filter((a) => a.status === "assigned").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {assets.filter((a) => a.status === "available").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{users.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(assets.map((a) => a.category))).map((category) => {
                    const count = assets.filter((a) => a.category === category).length
                    const percentage = ((count / assets.length) * 100).toFixed(1)
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-[#a4d72d] h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .slice(-5)
                    .reverse()
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-[#a4d72d] rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.content}</p>
                          <p className="text-xs text-gray-500">Serial: {doc.serialNumber}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                const reportData = {
                  generatedDate: new Date().toLocaleString(),
                  totalAssets: assets.length,
                  assignedAssets: assets.filter((a) => a.status === "assigned").length,
                  availableAssets: assets.filter((a) => a.status === "available").length,
                  totalUsers: users.length,
                  assets: assets,
                  users: users,
                }

                const serialNumber = generateSerialNumber()
                const reportContent = `WERK ASSET MANAGEMENT SYSTEM
COMPREHENSIVE SYSTEM REPORT

Serial Number: ${serialNumber}
Generated: ${reportData.generatedDate}

SUMMARY STATISTICS:
Total Assets: ${reportData.totalAssets}
Assigned Assets: ${reportData.assignedAssets}
Available Assets: ${reportData.availableAssets}
Total Users: ${reportData.totalUsers}

ASSET DETAILS:
${assets
  .map(
    (asset) => `
Asset: ${asset.name}
Category: ${asset.category}
Serial: ${asset.serialNumber}
Tag: ${asset.tagNumber}
Status: ${asset.status}
${asset.assignedTo ? `Assigned to: ${asset.assignedTo}` : ""}
${asset.assignedDate ? `Assigned Date: ${asset.assignedDate}` : ""}
`,
  )
  .join("\n")}

USER DETAILS:
${users
  .map(
    (user) => `
Name: ${user.name}
Role: ${user.role}
Email: ${user.email}
Mobile: ${user.mobileNumber || "N/A"}
Created: ${user.createdDate}
`,
  )
  .join("\n")}

©2025. Women Educational Researchers of Kenya. All Rights Reserved.
System developed by Don Kelvin | 0759954921`

                generatePDFContent(reportContent, `system-report-${serialNumber}.pdf`)
              }}
              className="px-4 py-2 bg-[#a4d72d] text-white rounded-lg hover:bg-[#8bc226] transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Generate Full System Report
            </button>

            <button
              onClick={() => {
                const assetReport = assets.map((asset) => ({
                  Name: asset.name,
                  Category: asset.category,
                  Serial: asset.serialNumber,
                  Tag: asset.tagNumber,
                  Status: asset.status,
                  AssignedTo: asset.assignedTo || "N/A",
                  AssignedDate: asset.assignedDate || "N/A",
                  Condition: asset.assignmentCondition || "N/A",
                }))

                const csvContent = [
                  Object.keys(assetReport[0]).join(","),
                  ...assetReport.map((row) => Object.values(row).join(",")),
                ].join("\n")

                const blob = new Blob([csvContent], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `asset-report-${new Date().toISOString().split("T")[0]}.csv`
                a.click()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export Assets CSV
            </button>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">View and manage your profile</p>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleAddUser({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  idNumber: formData.get("idNumber") as string,
                  role: formData.get("role") as "manager" | "staff",
                  mobileNumber: formData.get("mobileNumber") as string,
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number *</label>
                <input
                  name="idNumber"
                  type="text"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                <input
                  name="mobileNumber"
                  type="tel"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select name="role" required className="w-full p-2 border rounded-md">
                  <option value="">Select role</option>
                  <option value="manager">Asset Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#a4d72d] text-white rounded-lg hover:bg-[#8bc226] transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {user.role === "staff" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b">
              {/* Add profile tab to staff navigation and fix receipt download functionality */}
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setStaffActiveTab("request-items")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "request-items"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Request Items
                </button>
                <button
                  onClick={() => setStaffActiveTab("my-assets")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "my-assets"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Assets
                </button>
                <button
                  onClick={() => setStaffActiveTab("my-receipts")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "my-receipts"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Receipts
                </button>
                <button
                  onClick={() => setStaffActiveTab("profile")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    staffActiveTab === "profile"
                      ? "border-[#a4d72d] text-[#a4d72d]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>

            <div className="p-6">
              {staffActiveTab === "request-items" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Assets</h2>
                    <p className="text-gray-600 mb-6">Browse and request assets you need for your work.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assets
                      .filter((asset) => asset.status === "available")
                      .map((asset) => (
                        <Card key={asset.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{asset.name}</CardTitle>
                                <CardDescription>{asset.category}</CardDescription>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Available
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>
                                <strong>Serial:</strong> {asset.serialNumber}
                              </div>
                              <div>
                                <strong>Tag:</strong> {asset.tagNumber}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRequestAsset(asset.id)}
                              className="w-full mt-4 bg-[#a4d72d] hover:bg-[#8bc226]"
                              disabled={requests.some(
                                (r) => r.assetId === asset.id && r.requestedBy === user.name && r.status === "pending",
                              )}
                            >
                              {requests.some(
                                (r) => r.assetId === asset.id && r.requestedBy === user.name && r.status === "pending",
                              )
                                ? "Request Pending"
                                : "Request Asset"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {staffActiveTab === "my-assets" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">My Assigned Assets</h2>
                    <p className="text-gray-600 mb-6">Assets currently assigned to you.</p>
                  </div>

                  {myAssets.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No assets assigned to you yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Request assets from the "Request Items" tab.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {myAssets.map((asset) => (
                        <Card key={asset.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{asset.name}</CardTitle>
                                <CardDescription>{asset.category}</CardDescription>
                              </div>
                              <Badge variant="default" className="bg-[#a4d72d]">
                                Assigned
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>
                                <strong>Serial:</strong> {asset.serialNumber}
                              </div>
                              <div>
                                <strong>Tag:</strong> {asset.tagNumber}
                              </div>
                              <div>
                                <strong>Assigned:</strong> {asset.assignedDate}
                              </div>
                              <div>
                                <strong>Condition:</strong> {asset.assignmentCondition || "Good"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {staffActiveTab === "my-receipts" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">My Receipts</h2>
                    <p className="text-gray-600 mb-6">Download and view your receipts and documents.</p>
                  </div>

                  {documents.filter((doc) => doc.userName === user.name || doc.staffName === user.name).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <Package className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">No receipts available yet.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Receipts will appear here when assets are assigned or returned.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {documents
                        .filter((doc) => doc.userName === user.name || doc.staffName === user.name)
                        .map((doc) => (
                          <Card key={doc.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{doc.content}</CardTitle>
                                  <CardDescription>Serial: {doc.serialNumber}</CardDescription>
                                </div>
                                <Badge variant="outline">{doc.type.replace("_", " ").toUpperCase()}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>
                                  <strong>Generated:</strong> {doc.timestamp || doc.returnDate || doc.assignmentDate}
                                </div>
                                {doc.assetName && (
                                  <div>
                                    <strong>Asset:</strong> {doc.assetName}
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  const pdfContent = generatePDFContent(
                                    doc.content,
                                    doc.serialNumber,
                                    doc.timestamp ||
                                      doc.returnDate ||
                                      doc.assignmentDate ||
                                      new Date().toLocaleString(),
                                  )

                                  const blob = new Blob([pdfContent], { type: "application/pdf" })
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement("a")
                                  a.href = url
                                  a.download = `${doc.type}_${doc.serialNumber}.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                  URL.revokeObjectURL(url)
                                }}
                                variant="outline"
                                size="sm"
                                className="mt-4"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {staffActiveTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">My Profile</h2>
                    <p className="text-gray-600 mb-6">View and manage your profile information.</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your account details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">ID Number</label>
                          <p className="mt-1 text-sm text-gray-900">{user.idNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Official Email</label>
                          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                          <p className="mt-1 text-sm text-gray-900">{user.mobileNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">System Username</label>
                          <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Role</label>
                          <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Registration Date</label>
                          <p className="mt-1 text-sm text-gray-900">{user.registrationDate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Account Status</label>
                          <Badge variant="default" className="bg-[#a4d72d]">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user.role === "manager" && activeTab === "requests" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Review</h1>
            <p className="text-gray-600">Review and approve asset requests from staff</p>
          </div>

          <div className="grid gap-4">
            {requests.filter((request) => request.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Package className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No pending requests.</p>
                  <p className="text-sm text-gray-400 mt-2">New requests will appear here for review.</p>
                </CardContent>
              </Card>
            ) : (
              requests
                .filter((request) => request.status === "pending")
                .map((request) => {
                  const asset = assets.find((a) => a.id === request.assetId)
                  return (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{request.assetName}</CardTitle>
                            <CardDescription>Requested by {request.requestedBy}</CardDescription>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Category:</strong> {request.category}
                            </div>
                            <div>
                              <strong>Request Date:</strong> {request.requestedDate}
                            </div>
                            <div>
                              <strong>Asset Status:</strong>{" "}
                              <Badge variant={asset?.status === "available" ? "default" : "destructive"}>
                                {asset?.status || "Unknown"}
                              </Badge>
                            </div>
                          </div>

                          {asset?.status === "available" && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Asset Condition:</label>
                              <select
                                className="w-full p-2 border rounded-md"
                                defaultValue="Good"
                                id={`condition-${request.id}`}
                              >
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Needs Maintenance">Needs Maintenance</option>
                              </select>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {asset?.status === "available" ? (
                              <Button
                                onClick={() => {
                                  const conditionSelect = document.getElementById(
                                    `condition-${request.id}`,
                                  ) as HTMLSelectElement
                                  const condition = conditionSelect?.value || "Good"
                                  handleApproveRequest(request.id, condition)
                                }}
                                className="bg-[#a4d72d] hover:bg-[#8bc226]"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Assign
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleRejectRequest(request.id, "Asset not available")}
                                variant="destructive"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Reject - Not Available
                              </Button>
                            )}
                            <Button onClick={() => handleRejectRequest(request.id, "Request denied")} variant="outline">
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        </div>
      )}

      {activeTab === "assets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
              <p className="text-gray-600">Manage assets and their assignments</p>
            </div>
            <Button
              onClick={() => setShowAddAsset(!showAddAsset)}
              className="bg-[#a4d72d] hover:bg-[#8fb825] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>

          {showAddAsset && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Asset</CardTitle>
                <CardDescription>Fill in the asset details to add it to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const assetData = {
                    name: formData.get('name') as string,
                    category: formData.get('category') as string,
                    serialNumber: formData.get('serialNumber') as string,
                  }
                  
                  if (assetData.name && assetData.category && assetData.serialNumber) {
                    const success = await handleAddAsset(assetData)
                    if (success) {
                      setShowAddAsset(false)
                      ;(e.target as HTMLFormElement).reset()
                    }
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                      <Input 
                        name="name"
                        placeholder="e.g., MacBook Pro 16&quot;"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        name="category"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a4d72d] focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <Input 
                        name="serialNumber"
                        placeholder="e.g., MBP2024001"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="bg-[#a4d72d] hover:bg-[#8fb825] text-white"
                    >
                      Add Asset
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddAsset(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{asset.name}</CardTitle>
                      <CardDescription>{asset.category}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={asset.status === "available" ? "default" : "secondary"}>{asset.status}</Badge>
                      {asset.status === "available" && user?.role === "admin" && (
                        <Button
                          onClick={() => handleDeleteAsset(asset.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Serial:</strong> {asset.serialNumber}
                    </div>
                    <div>
                      <strong>Tag:</strong> {asset.tagNumber}
                    </div>
                    {asset.assignedTo && (
                      <>
                        <div>
                          <strong>Assigned to:</strong> {asset.assignedTo}
                        </div>
                        <div>
                          <strong>Assigned Date:</strong> {asset.assignedDate}
                        </div>
                        <div>
                          <strong>Condition:</strong> {asset.assignmentCondition || "Good"}
                        </div>
                      </>
                    )}
                  </div>
                  {asset.status === "assigned" && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">Return Condition:</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        defaultValue="Good"
                        id={`return-condition-${asset.id}`}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Needs Repair">Needs Repair</option>
                      </select>
                      <Button
                        onClick={async () => {
                          const conditionSelect = document.getElementById(
                            `return-condition-${asset.id}`,
                          ) as HTMLSelectElement
                          const condition = conditionSelect?.value || "Good"
                          await handleReturnAssetAPI(asset.id, condition)
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Process Return
                      </Button>
                    </div>
                  )}
                  {asset.status === "available" && user?.role !== "staff" && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">Assign to User:</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        id={`assign-user-${asset.id}`}
                      >
                        <option value="">Select User</option>
                        {users.filter(u => u.role !== "admin").map((user) => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                      <Button
                        onClick={async () => {
                          const userSelect = document.getElementById(
                            `assign-user-${asset.id}`,
                          ) as HTMLSelectElement
                          const userId = parseInt(userSelect?.value || "0")
                          if (userId > 0) {
                            await handleAssignAssetAPI(asset.id, userId)
                          }
                        }}
                        className="w-full bg-[#a4d72d] hover:bg-[#8fb825] text-white"
                        size="sm"
                      >
                        Assign Asset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
