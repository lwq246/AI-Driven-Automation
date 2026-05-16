import { Users, UserPlus, TrendingUp, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NetworkPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Manage Linkages</h2>
          </div>
          <div className="p-2">
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-linkedin-blue font-medium bg-blue-50 rounded-md">
              Active Linkages
              <span className="bg-linkedin-blue text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 rounded-md mt-1">
              Graduated Linkages
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">1</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 rounded-md mt-1">
              Program Enrollments
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">2</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-3 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Your Active Ecosystem Linkages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Linkage Card 1 */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <TrendingUp className="h-3 w-3" /> Health: 94%
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-linkedin-blue font-bold text-xl">AR</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Dr. Azmi Rahman</h3>
                  <p className="text-sm text-gray-500">Mentorship • Go-To-Market Strategy</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Linked via: <strong>Cradle Mentorship Initiative</strong></p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last interaction: 2 days ago</span>
                  <button className="text-sm text-linkedin-blue font-semibold hover:underline">Log Interaction</button>
                </div>
              </div>
            </div>

            {/* Linkage Card 2 (At Risk) */}
            <div className="border border-orange-200 rounded-lg p-4 shadow-sm relative bg-orange-50/30">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                <AlertCircle className="h-3 w-3" /> Health: 45%
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-xl">SL</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Sarah Lim</h3>
                  <p className="text-sm text-gray-500">Mentorship • Enterprise Sales</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-100">
                <p className="text-xs text-gray-500 mb-2">Linked via: <strong>CIP Spark AI Cohort</strong></p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600 font-medium">Last interaction: 18 days ago</span>
                  <button className="text-sm text-orange-700 font-semibold bg-white border border-orange-200 px-3 py-1 rounded-md hover:bg-orange-100 shadow-sm">
                    Re-engage
                  </button>
                </div>
              </div>
            </div>

            {/* Linkage Card 3 (Partnership) */}
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <TrendingUp className="h-3 w-3" /> Active
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex-shrink-0 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">AWS Activate</h3>
                  <p className="text-sm text-gray-500">Partnership • Cloud Infrastructure</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Resource: <strong>$10k Cloud Credits</strong></p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Redeemed: Jan 2026</span>
                  <button className="text-sm text-linkedin-blue font-semibold flex items-center gap-1 hover:underline">
                    Access Portal <ExternalLink className="h-3 w-3"/>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
