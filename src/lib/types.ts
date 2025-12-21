/**
 * Centralized type definitions for the Translations application
 * This file contains all shared interfaces and types used across the app
 */

// ============================================================================
// Authentication & User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthContext {
  userId: string;
  email: string;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  memberRole?: 'editor' | 'admin' | null;
}

export interface ProjectMember {
  userId: string;
  role: 'editor' | 'admin';
  locales: string[] | null;
  user: User;
}

// ============================================================================
// Term Types
// ============================================================================

export interface Term {
  id: string;
  key: string;
  description: string | null;
  projectId: string;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
  labels?: Label[];
}

export interface UITerm {
  id: string;
  value: string;
  context?: string | null;
  isLocked?: boolean;
  labels: Array<{ id: string; name: string }>;
  date: {
    created: string;
    modified: string;
  };
}

// ============================================================================
// Translation Types
// ============================================================================

export interface Translation {
  id: string;
  termId: string;
  localeCode: string;
  value: string;
  updatedAt: Date;
}

export interface TranslationData {
  termId: string;
  value?: string;
}

// ============================================================================
// Locale Types
// ============================================================================

export interface Locale {
  id: string;
  code: string;
  name: string;
  projectId: string;
}

export interface LocaleDefinition {
  code: string;
  name: string;
  language?: string;
  region?: string;
}

export interface UILocale {
  id: string;
  locale: {
    code: string;
    language?: string;
    region?: string;
  };
  date: string;
}

export interface LocaleItem {
  code: string;
  name: string;
}

// ============================================================================
// Label Types
// ============================================================================

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

// ============================================================================
// API Key Types
// ============================================================================

export interface ApiKey {
  id: string;
  name: string;
  role: 'read-only' | 'editor' | 'admin';
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

// ============================================================================
// API Request Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateTermRequest {
  key: string;
  description?: string;
}

export interface UpdateTermRequest {
  key?: string;
  description?: string;
}

export interface AddTermRequest {
  value: string;
  context?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  role: 'read-only' | 'editor' | 'admin';
}

export interface AddMemberRequest {
  email: string;
  role: 'editor' | 'admin';
  locales?: string[];
}

export interface UpdateMemberRequest {
  role?: 'editor' | 'admin';
  locales?: string[];
}

export interface AddLocaleRequest {
  code: string;
  name: string;
}

export interface UpdateTranslationRequest {
  value: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SetLabelsRequest {
  labelIds: string[];
}

export interface LockTermRequest {
  locked: boolean;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
