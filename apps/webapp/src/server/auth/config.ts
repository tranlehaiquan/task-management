import { type DefaultSession, type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { apiClient, type User as ApiUser } from '~/lib/api-client'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
      isActive: boolean
      isEmailVerified: boolean
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends ApiUser {
    accessToken: string
  }

  interface JWT {
    id?: string
    email?: string
    name?: string
    avatarUrl?: string | null
    isActive?: boolean
    isEmailVerified?: boolean
    accessToken?: string
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await apiClient.login(
            credentials.email as string,
            credentials.password as string,
          )

          if (!response.token || !response.user) {
            return null
          }

          // Return user with access token
          return {
            ...response.user,
            accessToken: response.token,
          }
        } catch (error) {
          // Log error for debugging but return null for failed auth
          console.error('Login error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.avatarUrl = user.avatarUrl
        token.isActive = user.isActive
        token.isEmailVerified = user.isEmailVerified
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && token?.email && token?.name) {
        session.user.id = token.id as string
        session.user.email = token.email
        session.user.name = token.name ?? ''
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null
        session.user.isActive = (token.isActive as boolean) ?? true
        session.user.isEmailVerified =
          (token.isEmailVerified as boolean) ?? false
        session.accessToken = token.accessToken as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user',
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
