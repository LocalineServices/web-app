# Setup Guide

This guide will help you set up the Localine application from scratch.

## Prerequisites

- Node.js 18 or higher
- MariaDB 10.5+ or MySQL 8.0+
- npm or yarn

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd LocalineApp
npm install
```

**Note:** The Prisma Client will be automatically generated during `npm install` via the `postinstall` script.

## Step 2: Database Setup

```bash
# Login to MariaDB
mysql -u root -p

# Create database
CREATE DATABASE localine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit
```

## Step 3: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Environment Variables Configuration

# Database Configuration (Prisma)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=localine

# JWT Secret (Change in production!)
JWT_SECRET=your-secret-jwt-key-change-in-production-min-32-chars

# Node Environment
NODE_ENV=development
```

**Security Note:** Never commit your `.env` file to version control!

## Step 4: Start the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Step 5: Create Your First Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 8 characters)
4. Click "Create account"

You'll be automatically logged in and redirected to the projects page.

## API Keys (Optional)

If you want to use the API programmatically:

1. Go to Project Settings → API Keys
2. Click "Generate New API Key"
3. Choose a role:
   - **read-only**: Can only fetch translations
   - **editor**: Can add/edit translations and terms
   - **admin**: Full project access
4. Copy the API key (shown only once!)
5. Use it in your API requests:

```bash
curl -H "Authorization: Bearer tk_your_api_key_here" \
  http://localhost:3000/api/v1/projects/:projectId/terms
```

## Next Steps

- Explore the API documentation in README.md
- Import/export translations
- Integrate with your application
- Set up automated backups for your database

## Support

For issues or questions, please open an issue on GitHub.
