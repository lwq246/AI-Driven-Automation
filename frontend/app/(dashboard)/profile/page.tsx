import { CheckCircle, Briefcase, MapPin, Link as LinkIcon, Building2 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
           <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all">
             Edit Cover
           </button>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden z-10">
              <Building2 className="h-16 w-16 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 font-semibold text-gray-600 border border-gray-400 rounded-full hover:bg-gray-50">
                Edit Profile
              </button>
              <button className="px-4 py-1.5 font-semibold text-white bg-linkedin-blue rounded-full hover:bg-blue-700">
                Share Profile
              </button>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TechNova Solutions</h1>
            <p className="text-lg text-gray-600 mt-1">AI-Driven B2B SaaS for Supply Chain Optimization</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> Kuala Lumpur, Malaysia</span>
              <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4"/> technovasolutions.com.my</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-semibold border border-green-200">
                <CheckCircle className="h-4 w-4" /> SSM Verified (1234567-T)
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold border border-blue-200">
                <Briefcase className="h-4 w-4" /> Cradle CIP Spark Grantee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Startup</h2>
        <p className="text-sm text-gray-800 leading-relaxed">
          TechNova Solutions is revolutionizing the Malaysian supply chain sector by integrating predictive AI models to forecast disruptions. We focus on mid-to-large tier logistics providers, helping them reduce operational downtime by up to 30%. Currently in the Seed stage and looking for active mentorship in enterprise B2B sales cycles to scale our operations across Southeast Asia.
        </p>
      </div>

      {/* Current Needs (AI Vector Matching target) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Ecosystem Needs</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Powers AI Matching Engine</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-50 text-linkedin-blue text-sm font-medium rounded-full border border-blue-100">Enterprise Sales Strategy</span>
          <span className="px-3 py-1 bg-blue-50 text-linkedin-blue text-sm font-medium rounded-full border border-blue-100">Series A Fundraising</span>
          <span className="px-3 py-1 bg-blue-50 text-linkedin-blue text-sm font-medium rounded-full border border-blue-100">Cloud Architecture (AWS)</span>
        </div>
      </div>
    </div>
  );
}
