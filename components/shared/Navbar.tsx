import Link from 'next/link';
import { Search, Home, Users, Briefcase, User, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-linkedin-blue font-bold text-2xl tracking-tighter">in</span>
              <span className="ml-2 font-bold text-gray-800">Cradle Ecosystem</span>
            </div>
            <div className="hidden sm:flex ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-blue-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-linkedin-blue focus:ring-1 focus:ring-linkedin-blue sm:text-sm"
                  placeholder="Search startups, mentors..."
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-gray-500">
            <Link href="/feed" className="flex flex-col items-center hover:text-gray-900 pt-2 pb-1">
              <Home className="h-5 w-5" />
              <span className="text-xs hidden sm:block">Home</span>
            </Link>
            <Link href="/network" className="flex flex-col items-center hover:text-gray-900 pt-2 pb-1">
              <Users className="h-5 w-5" />
              <span className="text-xs hidden sm:block">My Linkages</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center hover:text-gray-900 pt-2 pb-1">
              <User className="h-5 w-5" />
              <span className="text-xs hidden sm:block">Profile</span>
            </Link>
            <Link href="/admin" className="flex flex-col items-center hover:text-gray-900 pt-2 pb-1">
              <Settings className="h-5 w-5" />
              <span className="text-xs hidden sm:block">Admin</span>
            </Link>
            <Link href="/login" className="flex flex-col items-center hover:text-gray-900 pt-2 pb-1 border-l pl-4 ml-2 border-gray-200">
              <span className="text-xs font-semibold text-linkedin-blue">Sign Out</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
