# WERK Asset Management System

A modern web application for managing organizational assets built with Next.js and TypeScript.

## Features

- **User Management**: Admin, Manager, and Staff role-based access control
- **Asset Tracking**: Complete asset lifecycle management with assignment tracking
- **Document Generation**: PDF reports and user credential receipts
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: Encrypted password storage and session management
- **Database Integration**: Supabase PostgreSQL backend with fallback support

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd werk-asset-management-system
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Login

- **Username**: Admin.Asset@werk
- **Password**: werk@321

## Database Setup

This application supports Supabase PostgreSQL. Run the SQL scripts in the `database/` directory to set up your tables:

- `init.sql` - Creates tables and initial data

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Database**: Supabase PostgreSQL
- **Authentication**: Custom API routes with bcryptjs
- **Icons**: Lucide React

## Deployment

Ready for deployment on Vercel with automatic CI/CD from GitHub.

## License

© 2025 Women Educational Researchers of Kenya (WERK). All rights reserved.
