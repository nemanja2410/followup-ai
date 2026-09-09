import Link from "next/link";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>
        <p className="text-gray-400 text-center text-sm">Start automating your salon follow-ups today.</p>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Business Name</label>
            <input type="text" placeholder="e.g. Studio Beauty" className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Email</label>
            <input type="email" placeholder="you@example.com" className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Password</label>
            <input type="password" placeholder="********" className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-white" />
          </div>
          
          <Link href="/dashboard" className="w-full mt-4">
            <button type="button" className="w-full p-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition">
              Sign Up
            </button>
          </Link>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account? <Link href="/login" className="text-white hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}