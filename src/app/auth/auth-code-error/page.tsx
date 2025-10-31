import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Authentication Error</h1>
        <p className="text-gray-600 mb-8">
          There was an error during authentication. This may be due to an expired or invalid link.
        </p>
        <Link
          href="/sign-in"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  )
}

