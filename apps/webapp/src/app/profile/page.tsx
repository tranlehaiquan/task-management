import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { LogoutButton } from "~/components/logout-button";
import { VerifyEmailButton } from "~/components/verify-email-button";

export default async function ProfilePage() {
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
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="font-medium text-gray-900">
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information</p>
        </div>

        <div className="rounded-lg bg-white shadow">
          {/* Profile Header */}
          <div className="border-b border-gray-200 px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {session.user.name}
                </h2>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Information
            </h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {session.user.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.user.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Status
                </dt>
                <dd className="mt-1 text-sm">
                  {session.user.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Email Verification
                </dt>
                <dd className="mt-1 text-sm">
                  {session.user.isEmailVerified ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Verified
                    </span>
                  ) : (
                    <div className="space-y-2">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Not Verified
                      </span>
                      <VerifyEmailButton variant="primary" />
                    </div>
                  )}
                </dd>
              </div>
              {session.user.avatarUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Avatar</dt>
                  <dd className="mt-1">
                    <img
                      src={session.user.avatarUrl}
                      alt={session.user.name}
                      className="h-16 w-16 rounded-full"
                    />
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-6">
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Back to Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
