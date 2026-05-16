'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Building2, TrendingUp, CheckCircle, AlertCircle, Loader2, Sparkles, Send, User } from 'lucide-react';
import { fetchFeed, matchMentors, logInteraction, type FeedItem, type MentorMatch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  role: string;
  company_name?: string;
  name?: string;
  verification_status?: string;
  industry?: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch the current user's role and profile data
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const token = session.access_token;

        // 1. Get user role
        const roleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!roleRes.ok) {
          router.push('/login');
          return;
        }

        const roleData = await roleRes.json();
        
        if (roleData.role === 'None') {
          router.push('/onboard');
          return;
        }

        // 2. Fetch actor-specific profile from Supabase
        const userId = session.user.id;
        let profile: UserProfile = { role: roleData.role };

        if (roleData.role === 'Startup') {
          const { data } = await supabase
            .from('startups')
            .select('company_name, industry, verification_status')
            .eq('user_id', userId)
            .single();
          if (data) {
            profile = { ...profile, ...data };
          }
        } else if (roleData.role === 'Mentor') {
          const { data } = await supabase
            .from('mentors')
            .select('name, expertise_skills, bio')
            .eq('user_id', userId)
            .single();
          if (data) {
            profile = { ...profile, name: data.name };
          }
        } else if (roleData.role === 'Partner') {
          const { data } = await supabase
            .from('partners')
            .select('name, type, service_category')
            .eq('user_id', userId)
            .single();
          if (data) {
            profile = { ...profile, name: data.name };
          }
        }

        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    }
    loadUserProfile();
  }, [router]);

  // Fetch feed on mount
  useEffect(() => {
    async function loadFeed() {
      try {
        const data = await fetchFeed();
        setFeedItems(data);
      } catch (err) {
        console.log('Feed unavailable:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  // Fetch AI matches only for Startups
  useEffect(() => {
    if (!userProfile || userProfile.role !== 'Startup') return;

    async function loadMatches() {
      setMatchLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get the startup record to get the actual ID
        const { data: startup } = await supabase
          .from('startups')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (startup) {
          const result = await matchMentors({
            startup_id: startup.id,
            needs_text: 'Enterprise B2B sales strategy, cloud architecture, AI solutions',
            match_threshold: 0.3,
            match_count: 5,
          });
          if (result.matches.length > 0) setMentorMatches(result.matches);
        }
      } catch (err) {
        console.log('AI matching unavailable');
      } finally {
        setMatchLoading(false);
      }
    }
    loadMatches();
  }, [userProfile]);

  const handleLogInteraction = async () => {
    setLogStatus('logging');
    try {
      // Get a real linkage ID if available
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (startup) {
        const { data: linkages } = await supabase
          .from('mentorship_links')
          .select('id')
          .eq('startup_id', startup.id)
          .limit(1);

        if (linkages && linkages.length > 0) {
          await logInteraction(linkages[0].id, 'Quick check-in via feed');
        }
      }
      setLogStatus('success');
      setTimeout(() => setLogStatus(null), 3000);
    } catch {
      setLogStatus('error');
      setTimeout(() => setLogStatus(null), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const displayName = userProfile?.company_name || userProfile?.name || 'User';
  const roleLabel = userProfile?.role || '';
  const isVerified = userProfile?.verification_status === 'Verified';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Identity & Trust */}
      <div className="md:col-span-3 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-50"></div>
          <div className="px-4 pb-4 relative">
            <div className="h-16 w-16 rounded-full border-4 border-white bg-white mx-auto -mt-8 flex items-center justify-center shadow-sm overflow-hidden">
              {profileLoading ? (
                <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="text-center mt-2">
              <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">
                {roleLabel}{userProfile?.industry ? ` | ${userProfile.industry}` : ''}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  {isVerified ? (
                    <><CheckCircle className="h-3 w-3 text-green-600" /> SSM Verified</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 text-yellow-500" /> Pending Verification</>
                  )}
                </span>
                <span className={`font-medium ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isVerified ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              Sign out
            </button>
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

        {!loading && feedItems.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No feed items yet. The ecosystem is just getting started!</p>
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
        {/* AI Suggested Matches - Only for Startups */}
        {userProfile?.role === 'Startup' && (
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
              ) : !matchLoading ? (
                <p className="text-xs text-gray-500">No AI matches available yet. Update your challenges to get mentor recommendations.</p>
              ) : null}
            </div>
            
            {mentorMatches.length > 0 && (
              <button className="w-full mt-4 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 py-1.5 rounded-md transition-colors">
                View all recommendations
              </button>
            )}
          </div>
        )}

        {/* Welcome Card for Mentors/Partners */}
        {(userProfile?.role === 'Mentor' || userProfile?.role === 'Partner') && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Welcome, {displayName}
            </h3>
            <p className="text-xs text-gray-500">
              {userProfile.role === 'Mentor'
                ? 'You will see startup linkage requests and mentorship opportunities here once available.'
                : 'Your partner resources and startup engagement metrics will appear here.'}
            </p>
          </div>
        )}

        {/* Governance Alert - contextual */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
           <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" /> Attention Required
          </h3>
          <p className="text-xs text-orange-700">
            Check your active linkages for any interactions that may need a follow-up.
          </p>
          {userProfile?.role === 'Startup' && (
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
          )}
        </div>
      </div>
    </div>
  );
}
