# Setup Guide

This guide will help you set up the Translations application from scratch.

## Prerequisites

- Node.js 18 or higher
- MariaDB 10.5+ or MySQL 8.0+
- npm or yarn

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd Translations
npm install
```

**Note:** The Prisma Client will be automatically generated during `npm install` via the `postinstall` script.

## Step 2: Database Setup

### Create Database

```bash
# Login to MariaDB
mysql -u root -p

# Create database
CREATE DATABASE translations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit
```

### Import Schema

```bash
# Import the schema
mysql -u root -p translations < lib/db-schema.sql
```

### Verify Tables

```bash
mysql -u root -p translations

# Check tables
SHOW TABLES;

# You should see:
# - users
# - projects
# - api_keys
# - locales
# - labels
# - terms
# - translations
# - term_labels
# - translation_labels

exit
```

## Step 3: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration (Prisma format)
DATABASE_URL="mysql://root:your_database_password@localhost:3306/translations"

# JWT Secret - IMPORTANT: Generate a strong random string!
# You can use: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Node Environment
NODE_ENV=development
```

**Security Note:** Never commit your `.env` file to version control!

## Step 4: Generate Prisma Client

After setting up your database and environment variables:

```bash
# Generate Prisma Client from schema
npx prisma generate
```

This will generate the type-safe Prisma Client based on your database schema.

## Step 5: Start the Application

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

## Step 6: Create Your First Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 8 characters)
4. Click "Create account"

You'll be automatically logged in and redirected to the projects page.

## Step 7: Create Your First Project

1. Click "New Project" button
2. Enter project name and description
3. Click "Create project"
4. Click on the project to open it

## Step 8: Add Languages (Locales)

1. In your project, click "Add Locale"
2. Enter locale code (e.g., "en", "es", "fr")
3. Repeat for all languages you need

## Step 9: Add Translation Terms

1. Click "Add Term"
2. Enter the translation key (e.g., "welcome.message")
3. Optionally add context/description
4. The term will appear in your terms list

## Step 10: Add Translations

1. Select a locale from the dropdown
2. Find your term in the list
3. Click to edit and add the translation
4. Save your changes

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
  http://localhost:3000/api/v1/projects
```

## Prisma Commands

### Generate Client
```bash
npx prisma generate
```

### View Database in Prisma Studio
```bash
npx prisma studio
```

### Create a Migration (if you modify the schema)
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database (⚠️ Warning: Deletes all data)
```bash
npx prisma migrate reset
```

## Troubleshooting

### Database Connection Errors

- Verify MariaDB is running: `systemctl status mariadb`
- Check database credentials in `.env` (DATABASE_URL)
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Run `npx prisma generate` to regenerate the Prisma Client

### JWT_SECRET Warning

If you see warnings about JWT_SECRET:
- Make sure `.env` file exists
- Verify `JWT_SECRET` is set in `.env`
- Restart the development server

### Build Errors

```bash
# Clean build cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

### Prisma Client Errors

If you see errors about Prisma Client not being generated:
```bash
# Generate Prisma Client
npx prisma generate

# Restart development server
npm run dev
```

### Port Already in Use

If port 3000 is busy:
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

- Explore the API documentation in README.md
- Import/export translations
- Integrate with your application
- Set up automated backups for your database

## Support

For issues or questions, please open an issue on GitHub.
