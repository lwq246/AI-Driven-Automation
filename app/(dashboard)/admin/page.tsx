import { BarChart3, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ecosystem Governance</h1>
          <p className="text-sm text-gray-500">Cradle Program Overseer Dashboard</p>
        </div>
        <button className="bg-linkedin-blue text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700">
          Export Compliance Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Activity className="h-5 w-5 text-linkedin-blue" />
            <span className="text-sm font-medium">Total Active Linkages</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">142</span>
          <p className="text-xs text-green-600 mt-2 font-medium">↑ 12% from last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Avg Linkage Health</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">86%</span>
          <p className="text-xs text-gray-500 mt-2 font-medium">Stable ecosystem</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">At-Risk Linkages</span>
          </div>
          <span className="text-3xl font-bold text-orange-600">8</span>
          <p className="text-xs text-orange-600 mt-2 font-medium">AI Nudges Sent</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Matches Generated</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">1,024</span>
          <p className="text-xs text-gray-500 mt-2 font-medium">Via pgvector</p>
        </div>
      </div>

      {/* Main Governance View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Linkage Activity (Audit Log)</h2>
          </div>
          <div className="p-4 space-y-4">
             <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-linkedin-blue text-xs font-bold">SYS</div>
               <div>
                 <p className="text-sm text-gray-900">Auto-generated nudge sent to <strong>Johari</strong> (Mentor) regarding declining health with Startup X.</p>
                 <span className="text-xs text-gray-500">2 hours ago</span>
               </div>
             </div>
             <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
               <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">OK</div>
               <div>
                 <p className="text-sm text-gray-900"><strong>TechNova Solutions</strong> verified via SSM OCR module. Status updated to Verified.</p>
                 <span className="text-xs text-gray-500">5 hours ago</span>
               </div>
             </div>
             <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
               <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">NEW</div>
               <div>
                 <p className="text-sm text-gray-900">New program <strong>CIP Spark 2026</strong> initialized by Admin.</p>
                 <span className="text-xs text-gray-500">1 day ago</span>
               </div>
             </div>
          </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Trending Ecosystem Needs</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Enterprise B2B Sales</span>
                <span className="text-gray-500">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-linkedin-blue h-1.5 rounded-full" style={{width: '45%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Cloud Infrastructure</span>
                <span className="text-gray-500">32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-purple-600 h-1.5 rounded-full" style={{width: '32%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">ESG Compliance</span>
                <span className="text-gray-500">18%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-600 h-1.5 rounded-full" style={{width: '18%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
