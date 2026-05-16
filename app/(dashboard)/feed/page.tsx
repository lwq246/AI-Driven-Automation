import { Briefcase, Building2, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Identity & Trust */}
      <div className="md:col-span-3 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-50"></div>
          <div className="px-4 pb-4 relative">
            <div className="h-16 w-16 rounded-full border-4 border-white bg-white mx-auto -mt-8 flex items-center justify-center shadow-sm overflow-hidden">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center mt-2">
              <h2 className="text-lg font-semibold text-gray-900">TechNova Solutions</h2>
              <p className="text-sm text-gray-500">B2B SaaS | Seed Stage</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" /> SSM Verified
                </span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-blue-600" /> Cradle Grantee
                </span>
                <span className="text-blue-600 font-medium">CIP Spark</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Overall Linkage Health</span>
              <span className="text-[#0a66c2] font-semibold">94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-[#0a66c2] h-1.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">2 Active Mentorships</p>
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Ecosystem Feed */}
      <div className="md:col-span-6 space-y-4">
        {/* System Announcement Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-[#0a66c2]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Ecosystem Governance</p>
              <p className="text-xs text-gray-500">System Announcement • Just now</p>
            </div>
          </div>
          <p className="text-sm text-gray-800">
            🚀 <strong>TechNova Solutions</strong> has officially linked with <strong>Dr. Azmi Rahman</strong> for Go-To-Market strategy! This linkage is supported by the Cradle Mentorship Initiative.
          </p>
          <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-100 text-xs text-gray-600 flex items-center gap-2">
             <CheckCircle className="h-4 w-4 text-green-500" /> Linkage established and currently active.
          </div>
        </div>

        {/* Partner Update Banner */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">MDEC Partner Update</p>
              <p className="text-xs text-gray-500">Ecosystem Opportunity • 2 hours ago</p>
            </div>
          </div>
          <p className="text-sm text-gray-800">
            The new <strong>Digital Export Grant 2026</strong> applications are now open for verified B2B SaaS startups. Focus areas include AI and Cloud Infrastructure. 
          </p>
          <button className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">
            View Eligibility Criteria
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Intelligence & Governance */}
      <div className="md:col-span-3 space-y-4">
        {/* AI Suggested Matches */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0a66c2]" /> AI Suggested Mentors
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">Sarah Lim</p>
                <p className="text-xs text-gray-500 line-clamp-1">Ex-VP Sales at TechCorp | B2B Scaling</p>
                <p className="text-xs font-medium text-green-600 mt-1">92% Match (Enterprise Sales)</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">Khairul Anwar</p>
                <p className="text-xs text-gray-500 line-clamp-1">AI Solutions Architect</p>
                <p className="text-xs font-medium text-green-600 mt-1">88% Match (AI Infrastructure)</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 py-1.5 rounded-md transition-colors">
            View all recommendations
          </button>
        </div>

        {/* Governance Alert Example (For Admins/Startups) */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
           <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" /> Attention Required
          </h3>
          <p className="text-xs text-orange-700">
            Your linkage with Mentor <strong>Johari</strong> has not had a recorded interaction in 14 days. Health score is declining.
          </p>
          <button className="mt-2 text-xs font-semibold bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-md shadow-sm hover:bg-orange-100">
            Log Interaction
          </button>
        </div>
      </div>
    </div>
  );
}
