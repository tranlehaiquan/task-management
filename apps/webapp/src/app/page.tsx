import Link from 'next/link'
import { auth } from '~/server/auth'
import { LogoutButton } from '~/components/logout-button'

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="mb-4 text-6xl font-bold text-white">
            Task Management System
          </h1>
          <p className="mb-8 text-xl text-indigo-100">
            Integrated with API Gateway Authentication
          </p>

          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-white">
                Welcome back,{' '}
                <span className="font-semibold">{session.user.name}</span>!
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="rounded-md bg-indigo-700 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-800"
                >
                  View Profile
                </Link>
                <LogoutButton
                  variant="secondary"
                  className="px-6 py-3 text-lg shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/signin"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-indigo-700 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-800"
              >
                Sign Up
              </Link>
            </div>
          )}

          <div className="mt-12 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-white">Features</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/20 p-4">
                <h3 className="mb-2 font-semibold text-white">
                  Secure Authentication
                </h3>
                <p className="text-sm text-indigo-100">
                  JWT-based auth with NextAuth.js
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-4">
                <h3 className="mb-2 font-semibold text-white">
                  API Gateway Integration
                </h3>
                <p className="text-sm text-indigo-100">
                  Connected to NestJS microservices
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-4">
                <h3 className="mb-2 font-semibold text-white">Type-Safe</h3>
                <p className="text-sm text-indigo-100">
                  Full TypeScript support
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-200 hover:text-white underline"
            >
              View API Documentation (Swagger)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
