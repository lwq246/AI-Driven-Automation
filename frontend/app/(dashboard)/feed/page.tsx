'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Building2, TrendingUp, CheckCircle, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';
import { fetchFeed, matchMentors, logInteraction, type FeedItem, type MentorMatch } from '@/lib/api';

// Demo fallback data
const DEMO_FEED: FeedItem[] = [
  {
    id: '1',
    type: 'announcement',
    title: '🚀 New Linkage Formed',
    content: 'TechNova Solutions has officially linked with Dr. Azmi Rahman for Go-To-Market strategy! This linkage is supported by the Cradle Mentorship Initiative.',
    created_at: new Date().toISOString(),
    metadata: { startup: 'TechNova Solutions', mentor: 'Dr. Azmi Rahman' },
  },
  {
    id: '2',
    type: 'opportunity',
    title: '📢 Digital Export Grant 2026',
    content: 'The new Digital Export Grant 2026 applications are now open for verified B2B SaaS startups. Focus areas include AI and Cloud Infrastructure.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    metadata: { source: 'MDEC' },
  },
];

const DEMO_STARTUP_ID = 'demo-startup-001';

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(DEMO_FEED);
  const [loading, setLoading] = useState(true);
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Fetch feed on mount
  useEffect(() => {
    async function loadFeed() {
      try {
        const data = await fetchFeed();
        if (data.length > 0) setFeedItems(data);
      } catch (err) {
        console.log('Using demo feed data (backend unavailable)');
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  // Auto-fetch AI matches on mount
  useEffect(() => {
    async function loadMatches() {
      setMatchLoading(true);
      try {
        const result = await matchMentors({
          startup_id: DEMO_STARTUP_ID,
          needs_text: 'Enterprise B2B sales strategy, Series A fundraising, cloud architecture',
          match_threshold: 0.3,
          match_count: 5,
        });
        if (result.matches.length > 0) setMentorMatches(result.matches);
      } catch (err) {
        // Silently fall back to no matches
        console.log('AI matching unavailable — using static suggestions');
      } finally {
        setMatchLoading(false);
      }
    }
    loadMatches();
  }, []);

  const handleLogInteraction = async () => {
    setLogStatus('logging');
    try {
      await logInteraction('demo-linkage-001', 'Quick check-in via feed');
      setLogStatus('success');
      setTimeout(() => setLogStatus(null), 3000);
    } catch {
      setLogStatus('error');
      setTimeout(() => setLogStatus(null), 3000);
    }
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
              <div className="bg-[#0a66c2] h-1.5 rounded-full transition-all duration-1000" style={{ width: '94%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">2 Active Mentorships</p>
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Ecosystem Feed */}
      <div className="md:col-span-6 space-y-4">
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#0a66c2] animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading ecosystem feed...</span>
          </div>
        )}

        {feedItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                item.type === 'announcement' ? 'bg-blue-100' :
                item.type === 'opportunity' ? 'bg-purple-100' : 'bg-green-100'
              }`}>
                {item.type === 'announcement' ? <Briefcase className="h-5 w-5 text-[#0a66c2]" /> :
                 item.type === 'opportunity' ? <Building2 className="h-5 w-5 text-purple-600" /> :
                 <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">
                  {item.type === 'announcement' ? 'System Announcement' :
                   item.type === 'opportunity' ? 'Ecosystem Opportunity' : 'Linkage Update'} • {formatTime(item.created_at)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-800">{item.content}</p>
            {item.type === 'announcement' && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-100 text-xs text-gray-600 flex items-center gap-2">
                 <CheckCircle className="h-4 w-4 text-green-500" /> Linkage established and currently active.
              </div>
            )}
            {item.type === 'opportunity' && (
              <button className="mt-3 text-sm font-semibold text-[#0a66c2] hover:underline">
                View Eligibility Criteria
              </button>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: AI Intelligence & Governance */}
      <div className="md:col-span-3 space-y-4">
        {/* AI Suggested Matches */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#0a66c2]" /> AI Suggested Mentors
            {matchLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
          </h3>
          
          <div className="space-y-4">
            {mentorMatches.length > 0 ? (
              mentorMatches.slice(0, 3).map((match) => (
                <div key={match.mentor_id} className="flex gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[#0a66c2] font-bold text-sm">
                      {match.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-[#0a66c2] transition-colors">{match.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{match.skills_summary || 'Expert Mentor'}</p>
                    <p className="text-xs font-medium text-green-600 mt-1">{Math.round(match.similarity * 100)}% Match</p>
                  </div>
                </div>
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
          
          <button className="w-full mt-4 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 py-1.5 rounded-md transition-colors">
            View all recommendations
          </button>
        </div>

        {/* Governance Alert */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
           <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" /> Attention Required
          </h3>
          <p className="text-xs text-orange-700">
            Your linkage with Mentor <strong>Johari</strong> has not had a recorded interaction in 14 days. Health score is declining.
          </p>
          <button
            onClick={handleLogInteraction}
            disabled={logStatus === 'logging'}
            className="mt-2 text-xs font-semibold bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-md shadow-sm hover:bg-orange-100 disabled:opacity-50 flex items-center gap-1"
          >
            {logStatus === 'logging' ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Logging...</>
            ) : logStatus === 'success' ? (
              <><CheckCircle className="h-3 w-3 text-green-600" /> Logged!</>
            ) : (
              <><Send className="h-3 w-3" /> Log Interaction</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
