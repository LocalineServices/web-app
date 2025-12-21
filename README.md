# Localine

An open translation management platform for teams, built with Next.js 16, TypeScript, and MariaDB.

## Features

- 🔐 **User Authentication** - Secure signup/login with JWT-based session management
- 📁 **Project Management** - Create and manage multiple translation projects
- 👥 **Team Collaboration** - Invite team members with role-based access control
- 🌍 **Multi-language Support** - Add multiple locales to your projects
- 📝 **Terms & Translations** - Manage translation keys and their translations
- 🔑 **API Keys** - Generate API keys with role-based permissions
- 🎨 **Modern UI** - Beautiful interface built with Radix UI and Tailwind CSS

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_HOST` - Database host (default: localhost)
- `DATABASE_PORT` - Database port (default: 3306)
- `DATABASE_USER` - Database user
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name (default: localine)
- `JWT_SECRET` - **REQUIRED in production!** Secret key for JWT tokens (min 32 characters, use a strong random string)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MariaDB / MySQL
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with httpOnly cookies

## License

This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](LICENSE) file for details.
