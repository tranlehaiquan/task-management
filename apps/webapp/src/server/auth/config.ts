import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { apiClient, type User as ApiUser } from "~/lib/api-client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      isActive: boolean;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends ApiUser {
    accessToken: string;
  }

  interface JWT {
    accessToken?: string;
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
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await apiClient.login(
            credentials.email as string,
            credentials.password as string,
          );

          if (!response) {
            return null;
          }

          // Return user with access token
          return {
            ...response.user,
            accessToken: response.token,
          };
        } catch (error) {
          // Log error for debugging but return null for failed auth
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - only store minimal data (access token)
      if (user) {
        token.accessToken = user.accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      // Fetch fresh user data from API on every session access
      // This ensures user data is always up-to-date (e.g., email verification status)
      if (token?.accessToken) {
        const freshUser = await apiClient.getCurrentUser(
          token.accessToken as string,
        );

        // Populate session with fresh data from API
        session.user.id = freshUser.id;
        session.user.email = freshUser.email;
        session.user.name = freshUser.name;
        session.user.avatarUrl = freshUser.avatarUrl;
        session.user.isActive = freshUser.isActive;
        session.user.isEmailVerified = freshUser.isEmailVerified;
        session.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user',
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
