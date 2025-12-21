/**
 * OpenAPI/Swagger specification for the Translations API
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Translations API',
    version: '1.0.0',
    description: 'API for managing translation projects, terms, and locales',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API Key authentication (format: tk_...)',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Session cookie authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
            nullable: true,
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          ownerId: {
            type: 'string',
            format: 'uuid',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          memberRole: {
            type: 'string',
            enum: ['editor', 'admin'],
            nullable: true,
          },
        },
      },
      ProjectMember: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
          },
          role: {
            type: 'string',
            enum: ['editor', 'admin'],
          },
          locales: {
            type: 'array',
            items: {
              type: 'string',
            },
            nullable: true,
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      Term: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          key: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          projectId: {
            type: 'string',
            format: 'uuid',
          },
          locked: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Translation: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          termId: {
            type: 'string',
            format: 'uuid',
          },
          localeCode: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Locale: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          code: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          projectId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      Label: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          color: {
            type: 'string',
          },
          projectId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      ApiKey: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['read-only', 'editor', 'admin'],
          },
          prefix: {
            type: 'string',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          lastUsedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
    {
      CookieAuth: [],
    },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Create new user account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login to existing account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout current session',
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/me/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change user password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: {
                    type: 'string',
                  },
                  newPassword: {
                    type: 'string',
                    minLength: 8,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated or invalid password',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List all user projects',
        description: 'Returns all projects owned by the user and projects where user is a team member',
        responses: {
          200: {
            description: 'List of projects',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create new project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Project created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Project details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'Project not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project',
        description: 'Only owner or admin members can update project',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Project updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project',
        description: 'Only project owner can delete project',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Project deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/members': {
      get: {
        tags: ['Team Members'],
        summary: 'List team members',
        description: 'Only owner or admin members can view team members',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of team members',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProjectMember',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Team Members'],
        summary: 'Add team member',
        description: 'Only owner or admin members can add team members',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'role'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  role: {
                    type: 'string',
                    enum: ['editor', 'admin'],
                  },
                  locales: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Restrict editor to specific locales (optional)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Team member added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/ProjectMember',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/members/{userId}': {
      patch: {
        tags: ['Team Members'],
        summary: 'Update team member',
        description: 'Only owner or admin members can update team members',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['editor', 'admin'],
                  },
                  locales: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Team member updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/ProjectMember',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Team Members'],
        summary: 'Remove team member',
        description: 'Only owner or admin members can remove team members',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Team member removed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms': {
      get: {
        tags: ['Terms'],
        summary: 'List all terms',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of terms',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Term',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Terms'],
        summary: 'Create new term',
        description: 'Only admins can create terms, editors cannot',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key'],
                properties: {
                  key: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Term created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Term',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms/{termId}': {
      patch: {
        tags: ['Terms'],
        summary: 'Update term',
        description: 'Only admins can update terms, editors cannot',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'termId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Term updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Term',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Terms'],
        summary: 'Delete term',
        description: 'Only admins can delete terms, editors cannot',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'termId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Term deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms/{termId}/labels': {
      put: {
        tags: ['Terms'],
        summary: 'Set term labels',
        description: 'Set labels for a term. Editors and admins can set labels. If term is locked, only admins can modify labels.',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'termId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['labelIds'],
                properties: {
                  labelIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uuid',
                    },
                    description: 'Array of label IDs to set for the term',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Labels updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Term',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied or term is locked',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'Term not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms/{termId}/lock': {
      patch: {
        tags: ['Terms'],
        summary: 'Lock or unlock term',
        description: 'Toggle lock status of a term. Only admins can lock/unlock terms.',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'termId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['locked'],
                properties: {
                  locked: {
                    type: 'boolean',
                    description: 'Set to true to lock the term, false to unlock',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Term lock status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Term',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied - Only admins can lock/unlock terms',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'Term not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms/lock-all': {
      post: {
        tags: ['Terms'],
        summary: 'Lock all terms',
        description: 'Lock all terms in the project. Only admins can lock terms.',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'All terms locked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'All terms locked successfully',
                    },
                    count: {
                      type: 'number',
                      description: 'Number of terms locked',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied - Editors cannot lock terms',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/terms/unlock-all': {
      post: {
        tags: ['Terms'],
        summary: 'Unlock all terms',
        description: 'Unlock all terms in the project. Only admins can unlock terms.',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'All terms unlocked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'All terms unlocked successfully',
                    },
                    count: {
                      type: 'number',
                      description: 'Number of terms unlocked',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied - Editors cannot unlock terms',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/translations': {
      get: {
        tags: ['Locales'],
        summary: 'List all locales',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of locales',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Locale',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Locales'],
        summary: 'Add new locale',
        description: 'Only admins can add locales, editors cannot',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: {
                    type: 'string',
                    description: 'ISO 639-1 language code',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Locale added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Locale',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/translations/{localeCode}': {
      get: {
        tags: ['Translations'],
        summary: 'Get all translations for a locale',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'localeCode',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Translations for locale',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      additionalProperties: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/translations/{localeCode}/{termId}': {
      patch: {
        tags: ['Translations'],
        summary: 'Update translation',
        description: 'Editors can update only assigned locales',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'localeCode',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'termId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['value'],
                properties: {
                  value: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Translation updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Translation',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/labels': {
      get: {
        tags: ['Labels'],
        summary: 'List all labels',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of labels',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Label',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Labels'],
        summary: 'Create new label',
        description: 'Only admins can create labels',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'color'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  color: {
                    type: 'string',
                    description: 'Hex color code',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Label created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Label',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/labels/{labelId}': {
      patch: {
        tags: ['Labels'],
        summary: 'Update label',
        description: 'Only admins can update labels',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'labelId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  color: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Label updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Label',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Labels'],
        summary: 'Delete label',
        description: 'Only admins can delete labels',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'labelId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Label deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/api-keys': {
      get: {
        tags: ['API Keys'],
        summary: 'List API keys',
        description: 'Only owner or admin members can view API keys',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of API keys',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ApiKey',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['API Keys'],
        summary: 'Create new API key',
        description: 'Only owner or admin members can create API keys',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'role'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  role: {
                    type: 'string',
                    enum: ['read-only', 'editor', 'admin'],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'API key created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        key: {
                          type: 'string',
                          description: 'Full API key (only shown once)',
                        },
                        id: {
                          type: 'string',
                          format: 'uuid',
                        },
                        name: {
                          type: 'string',
                        },
                        role: {
                          type: 'string',
                        },
                        prefix: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/api-keys/{keyId}': {
      delete: {
        tags: ['API Keys'],
        summary: 'Revoke API key',
        description: 'Only owner or admin members can revoke API keys',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'keyId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'API key revoked',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/export': {
      get: {
        tags: ['Import/Export'],
        summary: 'Export project translations',
        description: 'Export translations in various formats (JSON flat, JSON nested, CSV, YAML). If no locales are specified, all project locales will be exported.',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'format',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['json-flat', 'json-nested', 'csv', 'yaml'],
              default: 'json-flat',
            },
            description: 'Export format',
          },
          {
            name: 'locales',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
            },
            description: 'Comma-separated list of locale codes to export (e.g., "en,es,fr"). If omitted, all project locales will be exported.',
          },
          {
            name: 'includeEmpty',
            in: 'query',
            required: false,
            schema: {
              type: 'boolean',
              default: false,
            },
            description: 'Whether to include terms with empty translations',
          },
        ],
        responses: {
          200: {
            description: 'Project translations exported',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                    },
                  },
                },
              },
              'text/csv': {
                schema: {
                  type: 'string',
                },
              },
              'application/x-yaml': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'No locales found in project',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/v1/projects/{projectId}/import': {
      post: {
        tags: ['Import/Export'],
        summary: 'Import project translations',
        description: 'Import translations from JSON (admins only)',
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  additionalProperties: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Translations imported',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                    imported: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};
