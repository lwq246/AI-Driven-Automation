'use client';

import { useState } from 'react';
import { CheckCircle, Briefcase, MapPin, Link as LinkIcon, Building2, Sparkles, Loader2, X, TrendingUp } from 'lucide-react';
import { matchMentors, type MentorMatch } from '@/lib/api';

const DEMO_NEEDS = [
  'Enterprise Sales Strategy',
  'Series A Fundraising',
  'Cloud Architecture (AWS)',
];

export default function ProfilePage() {
  const [matchResults, setMatchResults] = useState<MentorMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleFindMentors = async () => {
    setMatchLoading(true);
    setMatchError(null);
    setShowMatchPanel(true);

    try {
      const result = await matchMentors({
        startup_id: 'demo-startup-001',
        needs_text: DEMO_NEEDS.join(', '),
        match_threshold: 0.2,
        match_count: 5,
      });
      setMatchResults(result.matches);
    } catch (err) {
      setMatchError('AI matching is unavailable. Please ensure the backend is running and a Gemini API key is configured.');
    } finally {
      setMatchLoading(false);
    }
  };

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
              <button className="px-4 py-1.5 font-semibold text-white bg-[#0a66c2] rounded-full hover:bg-blue-700">
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
        <div className="flex flex-wrap gap-2 mb-4">
          {DEMO_NEEDS.map((need) => (
            <span key={need} className="px-3 py-1 bg-blue-50 text-[#0a66c2] text-sm font-medium rounded-full border border-blue-100">
              {need}
            </span>
          ))}
        </div>
        <button
          onClick={handleFindMentors}
          disabled={matchLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {matchLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Finding Mentors...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Find Matching Mentors with AI</>
          )}
        </button>
      </div>

      {/* AI Match Results Panel */}
      {showMatchPanel && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0a66c2]" /> AI Mentor Matches
            </h2>
            <button onClick={() => setShowMatchPanel(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {matchLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-[#0a66c2] animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Generating embeddings via Gemini & searching pgvector...</span>
            </div>
          )}

          {matchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {matchError}
            </div>
          )}

          {!matchLoading && !matchError && matchResults.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 text-center">
              No mentor matches found above the similarity threshold. Try adjusting your needs description.
            </div>
          )}

          {matchResults.length > 0 && (
            <div className="space-y-3">
              {matchResults.map((match, idx) => (
                <div
                  key={match.mentor_id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex-shrink-0 text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <span className="text-[#0a66c2] font-bold">
                        {match.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">#{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{match.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{match.skills_summary || 'Expert mentor in the ecosystem'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <TrendingUp className="h-4 w-4" />
                      {Math.round(match.similarity * 100)}%
                    </div>
                    <span className="text-xs text-gray-500">match score</span>
                  </div>
                  <button className="px-3 py-1.5 text-sm font-semibold text-[#0a66c2] border border-[#0a66c2] rounded-full hover:bg-[#0a66c2] hover:text-white transition-colors">
                    Connect
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center pt-2">
                Powered by Gemini text-embedding-004 + pgvector cosine similarity
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
