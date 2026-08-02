import { APIError, betterAuth } from "better-auth"
import {
  admin as adminPlugin,
  lastLoginMethod,
  openAPI,
} from "better-auth/plugins"
import { apiKey } from "@better-auth/api-key"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { ac, admin, user } from "@/lib/permission"
import { getApiKeysLimit } from "@/actions/get-env"

const signUpDisabled = process.env.DISABLE_SIGNUP === "true"

export const auth = betterAuth({
  appName: process.env.APP_NAME || "Localine",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: signUpDisabled,
    requireEmailVerification: false, // TODO: should be true if email service is configured
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    discord: {
      enabled:
        !!process.env.DISCORD_CLIENT_ID! &&
        !!process.env.DISCORD_CLIENT_SECRET!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    github: {
      enabled:
        !!process.env.GITHUB_CLIENT_ID! && !!process.env.GITHUB_CLIENT_SECRET!,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      enabled:
        !!process.env.GOOGLE_CLIENT_ID! && !!process.env.GOOGLE_CLIENT_SECRET!,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    apiKey([
      {
        configId: "default",
        startingCharactersConfig: {
          shouldStore: false,
        },
        defaultPrefix: "lapp_",
        requireName: true,
        enableMetadata: true,
        rateLimit: {
          timeWindow: 1000 * 60, // 1 minute
          maxRequests: 30, // 30 requests per minute
        },
      },
      {
        configId: "no-rate-limit",
        startingCharactersConfig: {
          shouldStore: false,
        },
        defaultPrefix: "lapp_",
        requireName: true,
        enableMetadata: true,
        rateLimit: {
          enabled: false,
        },
      },
    ]),
    openAPI({
      disableDefaultReference: process.env.NODE_ENV === "production",
    }),
  ],
  user: {
    additionalFields: {
      lastLoginMethod: {
        type: "string",
        required: false,
      },
      locale: {
        type: "string",
        defaultValue: "en_US",
        required: true,
      },
      projectsLimit: {
        type: "number",
        defaultValue: 5,
      },
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true, // TODO: should be false if email service is configured
    },
    deleteUser: {
      enabled: true,
    },
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      disableImplicitLinking: true,
    },
    encryptOAuthTokens: true,
  },
  advanced: {
    cookiePrefix: "localine",
  },
  hooks: {
    before: async (ctx) => {
      // @ts-expect-error - better-auth's types don't currently support discriminating by operationId
      if (ctx?.operationId === "createApiKey") {
        // @ts-expect-error - the body type is not properly inferred from better-auth's types
        const configId = ctx?.body?.configId
        if (
          !configId ||
          (configId !== "default" && configId !== "no-rate-limit")
        ) {
          throw new APIError("BAD_REQUEST", {
            message: "valid configId is required",
          })
        }

        if (
          !(
            await auth.api.userHasPermission({
              headers: ctx?.headers,
              body: {
                permissions: {
                  apiKeys: ["unlimited"],
                },
              },
            })
          ).success
        ) {
          const apiKeysCount = (
            await auth.api.listApiKeys({
              headers: ctx?.headers,
            })
          ).total
          const apiKeysLimit = await getApiKeysLimit()

          if (apiKeysCount >= apiKeysLimit) {
            throw new APIError("FORBIDDEN", {
              message:
                "You have reached your API key limit. Please delete existing API keys to create new ones.",
            })
          }
        }

        if (configId === "no-rate-limit") {
          const canDisableRateLimiting = (
            await auth.api.userHasPermission({
              headers: ctx?.headers,
              body: {
                permissions: {
                  apiKeys: ["no-rate-limit"],
                },
              },
            })
          ).success
          if (!canDisableRateLimiting) {
            throw new APIError("FORBIDDEN", {
              message:
                "You do not have permission to create API keys without rate limiting.",
            })
          }
        }
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (_, ctx) => {
          if (signUpDisabled && ctx?.path != "/admin/create-user") {
            throw new APIError("BAD_REQUEST", {
              message: "signup disabled",
            })
          }
        },
      },
    },
  },
})
