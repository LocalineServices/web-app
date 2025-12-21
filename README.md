# Translations App

A modern translation management system built with Next.js 16, TypeScript, and MariaDB.

## Features

- 🔐 **User Authentication** - Secure signup/login with JWT-based session management
- 📁 **Project Management** - Create and manage multiple translation projects
- 👥 **Team Collaboration** - Invite team members with role-based access control
- 🌍 **Multi-language Support** - Add multiple locales to your projects
- 📝 **Terms & Translations** - Manage translation keys and their translations
- 🔑 **API Keys** - Generate API keys with role-based permissions
- 🎨 **Modern UI** - Beautiful interface built with Radix UI and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- MariaDB 10.5+ (or MySQL 8.0+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Translations
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create a new database
mysql -u root -p -e "CREATE DATABASE translations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import the schema
mysql -u root -p translations < lib/db-schema.sql
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for required environment variables:

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: translations)
- `JWT_SECRET` - **REQUIRED in production!** Secret key for JWT tokens (min 32 characters, use a strong random string)

## API Documentation

### Authentication

All API endpoints (except authentication endpoints) require authentication via:
- **Cookie-based session** (for web interface)
- **API Key** (for programmatic access)

#### Auth Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login to existing account
- `POST /api/auth/logout` - Logout current session

### Projects API

- `GET /api/v1/projects` - List all user projects (owned and team member)
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project (owner or admin members only)
- `DELETE /api/v1/projects/:id` - Delete project (owner only)

### Team Collaboration API

- `GET /api/v1/projects/:id/members` - List team members (owner or admin members only)
- `POST /api/v1/projects/:id/members` - Add team member (owner or admin members only)
- `PATCH /api/v1/projects/:id/members/:userId` - Update team member role/locales (owner or admin members only)
- `DELETE /api/v1/projects/:id/members/:userId` - Remove team member (owner or admin members only)

#### Team Member Roles

- **editor** - Can only translate existing terms in assigned locales
  - View project, terms, and translations
  - Update translations (in assigned locales if specified)
  - Cannot create/update/delete terms, locales, labels, or manage API keys
- **admin** - Can do everything except delete the project
  - All permissions of owner except project deletion
  - Can manage team members, API keys, terms, locales, and translations

### Terms API

- `GET /api/v1/projects/:id/terms` - List all terms
- `POST /api/v1/projects/:id/terms` - Create new term (admins only, editors cannot)
- `PATCH /api/v1/projects/:id/terms/:termId` - Update term (admins only, editors cannot)
- `DELETE /api/v1/projects/:id/terms/:termId` - Delete term (admins only, editors cannot)

### Locales API

- `GET /api/v1/projects/:id/translations` - List all locales
- `POST /api/v1/projects/:id/translations` - Add new locale (admins only, editors cannot)
- `DELETE /api/v1/projects/:id/translations/:localeId` - Remove locale (admins only, editors cannot)

### Translations API

- `GET /api/v1/projects/:id/translations/:localeCode` - Get all translations for locale
- `PATCH /api/v1/projects/:id/translations/:localeCode/:termId` - Update translation (editors restricted to assigned locales)

### API Keys

- `GET /api/v1/projects/:id/api-keys` - List API keys (owner or admin members only)
- `POST /api/v1/projects/:id/api-keys` - Create new API key (owner or admin members only)
- `DELETE /api/v1/projects/:id/api-keys/:keyId` - Revoke API key (owner or admin members only)

#### API Key Roles

- **read-only** - Can only perform GET requests
- **editor** - Can perform GET, POST, and PATCH requests (manage translations, not terms/locales)
- **admin** - Full access to project management including team member management

#### Using API Keys

Include the API key in the Authorization header:
```bash
curl -H "Authorization: Bearer tk_your_api_key_here" \
  https://your-domain.com/api/v1/projects
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MariaDB / MySQL
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with httpOnly cookies

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

This project is licensed under the MIT License.
