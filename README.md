# WERK Asset Management System

A modern web application for managing organizational assets built with Next.js.

## Features

- User Management (Admin, Manager, Staff roles)
- Asset Tracking and Assignment
- Document Generation and Reports
- Responsive Design
- Secure Authentication

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/Donkoyote123/werk-asset-management-system.git
cd werk-asset-management-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

- **Username**: Admin.Asset@werk
- **Password**: werk@321

## Deployment

This application is ready to deploy on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

For production, consider adding a database like Vercel Postgres for persistent data storage.

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Custom API routes with bcrypt
- **Icons**: Lucide React

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # Reusable UI components
├── lib/                   # Utility functions
└── public/                # Static assets
```

## License

This project is for internal use by Women Educational Researchers of Kenya (WERK).
