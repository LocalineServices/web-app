<div align="center">
  <img src=".github/branding/logo.png" alt="Localine Logo" width="200"/>
  
  # Localine Setup Guide
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![MariaDB](https://img.shields.io/badge/MariaDB-10.5+-blue.svg)](https://mariadb.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
  
  **Complete step-by-step guide to set up Localine from scratch**
  
  [Prerequisites](#prerequisites) • [Installation](#installation) • [Database](#database-setup) • [Configuration](#configuration) • [Getting Started](#getting-started)
</div>

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Starting the Application](#starting-the-application)
- [Create Your First Account](#create-your-first-account)
- [API Keys](#api-keys-optional)
- [Next Steps](#next-steps)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **MariaDB** | 10.5+ | Database server |
| **MySQL** | 8.0+ | Alternative database |
| **npm** | Latest | Package manager |

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/LocalineServices/web-app.git
cd web-app
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note:** The Prisma Client will be automatically generated during `npm install` via the `postinstall` script.

---

## 🗄️ Database Setup

### Create the Database

Login to MariaDB/MySQL and create the database:

```bash
# Login to MariaDB
mysql -u root -p
```

```sql
-- Create database with UTF-8 support
CREATE DATABASE localine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Exit MySQL
exit
```

## ⚙️ Environment Configuration

### Step 1: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 2: Configure Variables

Edit `.env` with your settings:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=localine

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-jwt-key-change-in-production-min-32-chars

# Signups Configuration
SIGNUPS_ENABLED=true

# Node Environment
NODE_ENV=development
```

### Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | Database server hostname | `localhost` | ✅ |
| `DATABASE_PORT` | Database server port | `3306` | ✅ |
| `DATABASE_USER` | Database username | `root` | ✅ |
| `DATABASE_PASSWORD` | Database password | `your_password` | ✅ |
| `DATABASE_NAME` | Database name | `localine` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `random-string` | ✅ |
| `SIGNUPS_ENABLED` | Allow new account creation through web interface and API | `true` | ❌ |
| `NODE_ENV` | Environment mode | `development` / `production` | ✅ |

⚠️ **Security Note:** Never commit your `.env` file to version control!

---

## 🎯 Starting the Application

### Run Migrations

After configuring your environment variables (next step), run:

```bash
npx prisma migrate dev
```

This will create all necessary tables and relationships.

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at:
```
http://localhost:3000
```

### Production Mode

Build and start the production server:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 👤 Create Your First Account

### Sign Up Process

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Sign up"**
3. Fill in your details:
   - **Full Name** - Your display name
   - **Email** - Valid email address
   - **Password** - Minimum 8 characters
4. Click **"Create account"**

You'll be automatically logged in and redirected to the projects page.

### Create Your First Project

1. Click **"New Project"**
2. Enter project details:
   - **Name** - Your project name
   - **Description** - Optional project description
3. Click **"Create"**

---

## 🔑 API Keys (Optional)

Generate API keys for programmatic access to your translations.

### Creating an API Key

1. Navigate to **Project Settings → API Keys**
2. Click **"Generate New API Key"**
3. Select a role:

| Role | Permissions | Use Case |
|------|-------------|----------|
| **read-only** | Fetch translations only | Production apps |
| **editor** | Add/edit translations and terms | CI/CD pipelines |
| **admin** | Full project access | Administrative tools |

4. **Copy the API key** (shown only once!)

### Using Your API Key

Make authenticated requests with your API key:

```bash
curl -H "Authorization: Bearer tk_your_api_key_here" \
  http://localhost:3000/api/v1/projects/:projectId/terms
```

**Example - Fetch All Terms:**

```bash
curl -H "Authorization: Bearer tk_abc123..." \
  http://localhost:3000/api/v1/projects/my-project-id/terms
```

---

## 🎓 Next Steps

Now that Localine is set up, here's what you can do:

- 📖 **Read the Documentation** - Explore the [API documentation](http://localhost:3000/api)
- 🌍 **Add Languages** - Set up locales for your project
- 📝 **Create Terms** - Add translation keys
- ✍️ **Add Translations** - Translate your terms
- 👥 **Invite Team Members** - Collaborate with your team
- 📥 **Import/Export** - Bulk manage translations
- 🔗 **Integrate** - Connect with your application
- 💾 **Set Up Backups** - Configure automated database backups

---

## 📞 Support

Need help? We're here for you!

- **Information**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/LocalineServices/web-app/issues)

---

<div align="center">
  Made with ❤️ by ItzMxritz & LeonJS_
  
  [GitHub](https://github.com/LocalineServices) • [Documentation](README.md)
</div>
