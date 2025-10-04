import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { LogoutButton } from "~/components/logout-button";
import { VerifyEmailButton } from "~/components/verify-email-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-xl font-bold text-indigo-600 hover:text-indigo-500"
              >
                Task Management
              </Link>
              <nav className="hidden space-x-4 md:flex">
                <Link href="/dashboard" className="font-medium text-gray-900">
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden text-sm text-gray-600 sm:inline">
                {session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user.name}!
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Profile
            </h2>
            <div className="mt-4 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium text-gray-900">{session.user.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">
                  {session.user.email}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <p className="font-medium text-gray-900">
                  {session.user.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email Verified:</span>
                <p className="font-medium text-gray-900">
                  {session.user.isEmailVerified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-yellow-600">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="mt-4 space-y-2">
              <a
                href="/profile"
                className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              >
                View Full Profile
              </a>
              {!session.user.isEmailVerified && <VerifyEmailButton fullWidth />}
            </div>
          </div>

          {/* Session Info Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Session Info
            </h2>
            <div className="mt-4 space-y-2">
              <div>
                <span className="text-sm text-gray-500">User ID:</span>
                <p className="truncate font-mono text-xs text-gray-900">
                  {session.user.id}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Token:</span>
                <p className="truncate font-mono text-xs text-gray-900">
                  {session.accessToken
                    ? `${session.accessToken.substring(0, 20)}...`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
