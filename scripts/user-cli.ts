#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '@/lib/auth';

// Initialize Prisma client with MariaDB adapter
const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE_NAME;

if (!databaseHost || !databasePort || !databaseUser || !databasePassword || !databaseName) {
  console.error('❌ Database configuration missing. Please check your .env file.');
  console.error('   Required variables: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter: new PrismaMariaDb({ 
    host: databaseHost, 
    port: Number(databasePort), 
    user: databaseUser, 
    password: databasePassword, 
    database: databaseName 
  })
});

const program = new Command();

program
  .name('user-cli')
  .description('User management CLI for LocalineApp')
  .version('1.0.0');

// Create user command
program
  .command('create-user')
  .description('Create a new user account')
  .requiredOption('-e, --email <email>', 'User email address')
  .requiredOption('-p, --password <password>', 'User password')
  .requiredOption('-n, --name <name>', 'User full name')
  .action(async (options) => {
    try {
      console.log('🚀 Creating user...');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(options.email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
      }
      
      if (options.password.length < 8) {
        console.error('❌ Password must be at least 8 characters long');
        process.exit(1);
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { email: options.email }
      });
      
      if (existingUser) {
        console.error(`❌ User with email ${options.email} already exists`);
        process.exit(1);
      }
      
      const passwordHash = await hashPassword(options.password);
      
      const userId = uuidv4();
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: options.email,
          passwordHash,
          name: options.name,
        }
      });
      
      console.log('✅ User created successfully:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
    } catch (error) {
      console.error('❌ Error creating user:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

// Delete user command
program
  .command('delete-user')
  .description('Delete a user account by email or ID')
  .option('-e, --email <email>', 'User email address')
  .option('-i, --id <id>', 'User ID')
  .option('-f, --force', 'Force deletion without confirmation', false)
  .action(async (options) => {
    try {
      if (!options.email && !options.id) {
        console.error('❌ Either --email or --id must be provided');
        process.exit(1);
      }
      
      if (options.email && options.id) {
        console.error('❌ Provide either --email or --id, not both');
        process.exit(1);
      }
      
      console.log('🔍 Finding user...');
      
      const whereClause = options.email 
        ? { email: options.email }
        : { id: options.id };
        
      const user = await prisma.user.findUnique({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          projectMemberships: { 
            include: { 
              project: { select: { id: true, name: true } } 
            } 
          }
        }
      });
      
      if (!user) {
        const identifier = options.email || options.id;
        console.error(`❌ User not found: ${identifier}`);
        process.exit(1);
      }
      
      console.log('👤 User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Owned Projects: ${user.projects.length}`);
      console.log(`   Member of Projects: ${user.projectMemberships.length}`);
      
      if (user.projects.length > 0) {
        console.log('\n📁 Owned projects that will be deleted:');
        user.projects.forEach(project => {
          console.log(`   - ${project.name} (${project.id})`);
        });
      }
      
      if (user.projectMemberships.length > 0) {
        console.log('\n👥 Project memberships that will be removed:');
        user.projectMemberships.forEach(membership => {
          console.log(`   - ${membership.project.name} (${membership.role})`);
        });
      }
      
      if (!options.force) {
        const { default: inquirer } = await import('inquirer');
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: '⚠️  This action is irreversible. Are you sure you want to delete this user?',
          default: false
        }]);
        
        if (!confirm) {
          console.log('❌ Operation cancelled');
          process.exit(0);
        }
      }
      
      console.log('🗑️  Deleting user...');

      await prisma.user.delete({
        where: { id: user.id }
      });
      
      console.log('✅ User deleted successfully');
      
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        console.error('❌ User not found');
      } else {
        console.error('❌ Error deleting user:', error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

program.parse();