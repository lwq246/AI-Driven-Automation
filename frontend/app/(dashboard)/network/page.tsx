'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, Building2, ExternalLink, Loader2, CheckCircle, Mail, X } from 'lucide-react';
import { fetchLinkages, logInteraction, generateNudge, type NudgeResponse } from '@/lib/api';

interface LinkageCard {
  id: string;
  name: string;
  initials: string;
  type: string;
  topic: string;
  program: string;
  status: 'Active' | 'At-Risk' | 'Graduated' | 'Pending';
  health_score: number;
  last_interaction: string;
  days_since: number;
  is_partnership?: boolean;
  resource?: string;
}

const DEMO_LINKAGES: LinkageCard[] = [
  {
    id: 'link-001',
    name: 'Dr. Azmi Rahman',
    initials: 'AR',
    type: 'Mentorship',
    topic: 'Go-To-Market Strategy',
    program: 'Cradle Mentorship Initiative',
    status: 'Active',
    health_score: 94,
    last_interaction: '2 days ago',
    days_since: 2,
  },
  {
    id: 'link-002',
    name: 'Sarah Lim',
    initials: 'SL',
    type: 'Mentorship',
    topic: 'Enterprise Sales',
    program: 'CIP Spark AI Cohort',
    status: 'At-Risk',
    health_score: 45,
    last_interaction: '18 days ago',
    days_since: 18,
  },
  {
    id: 'link-003',
    name: 'AWS Activate',
    initials: '',
    type: 'Partnership',
    topic: 'Cloud Infrastructure',
    program: '',
    status: 'Active',
    health_score: 100,
    last_interaction: 'Jan 2026',
    days_since: 0,
    is_partnership: true,
    resource: '$10k Cloud Credits',
  },
];

export default function NetworkPage() {
  const [linkages, setLinkages] = useState<LinkageCard[]>(DEMO_LINKAGES);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [nudgeModal, setNudgeModal] = useState<NudgeResponse | null>(null);

  useEffect(() => {
    async function loadLinkages() {
      try {
        const data = await fetchLinkages();
        if (data.length > 0) {
          const mapped: LinkageCard[] = data.map((l) => ({
            id: l.id,
            name: l.counterpart_name,
            initials: l.counterpart_name.split(' ').map((n: string) => n[0]).join(''),
            type: l.type === 'partnership' ? 'Partnership' : 'Mentorship',
            topic: l.program_name || 'General',
            program: l.program_name || '',
            status: l.status,
            health_score: l.health_score || 100,
            last_interaction: l.last_interaction_date
              ? `${Math.floor((Date.now() - new Date(l.last_interaction_date).getTime()) / 86400000)} days ago`
              : 'Unknown',
            days_since: l.last_interaction_date
              ? Math.floor((Date.now() - new Date(l.last_interaction_date).getTime()) / 86400000)
              : 0,
            is_partnership: l.type === 'partnership',
          }));
          setLinkages(mapped);
        }
      } catch {
        console.log('Using demo linkage data');
      } finally {
        setLoading(false);
      }
    }
    loadLinkages();
  }, []);

  const handleLogInteraction = async (linkageId: string) => {
    setActionStatus((prev) => ({ ...prev, [linkageId]: 'logging' }));
    try {
      await logInteraction(linkageId, 'Check-in via network page');
      setActionStatus((prev) => ({ ...prev, [linkageId]: 'success' }));
      // Update the card UI
      setLinkages((prev) =>
        prev.map((l) =>
          l.id === linkageId
            ? { ...l, health_score: 100, status: 'Active' as const, last_interaction: 'Just now', days_since: 0 }
            : l
        )
      );
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [linkageId]: '' })), 3000);
    } catch {
      setActionStatus((prev) => ({ ...prev, [linkageId]: 'error' }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [linkageId]: '' })), 3000);
    }
  };

  const handleReengage = async (linkage: LinkageCard) => {
    setActionStatus((prev) => ({ ...prev, [linkage.id]: 'nudging' }));
    try {
      const result = await generateNudge({
        linkage_id: linkage.id,
        startup_name: 'TechNova Solutions',
        mentor_name: linkage.name,
        last_interaction_date: new Date(Date.now() - linkage.days_since * 86400000).toISOString(),
        topic: linkage.topic,
      });
      setNudgeModal(result);
      setActionStatus((prev) => ({ ...prev, [linkage.id]: '' }));
    } catch {
      setActionStatus((prev) => ({ ...prev, [linkage.id]: 'error' }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [linkage.id]: '' })), 3000);
    }
  };

  const activeCount = linkages.filter((l) => l.status === 'Active').length;
  const graduatedCount = linkages.filter((l) => l.status === 'Graduated').length;
  const partnershipCount = linkages.filter((l) => l.is_partnership).length;

  const filteredLinkages = linkages.filter((l) => {
    if (filter === 'active') return l.status === 'Active' || l.status === 'At-Risk';
    if (filter === 'graduated') return l.status === 'Graduated';
    if (filter === 'partnerships') return l.is_partnership;
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Manage Linkages</h2>
          </div>
          <div className="p-2">
            <button
              onClick={() => setFilter('active')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'active' ? 'text-[#0a66c2] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active Linkages
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === 'active' ? 'bg-[#0a66c2] text-white' : 'bg-gray-100 text-gray-600'
              }`}>{activeCount}</span>
            </button>
            <button
              onClick={() => setFilter('graduated')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md mt-1 transition-colors ${
                filter === 'graduated' ? 'text-[#0a66c2] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Graduated Linkages
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{graduatedCount}</span>
            </button>
            <button
              onClick={() => setFilter('partnerships')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md mt-1 transition-colors ${
                filter === 'partnerships' ? 'text-[#0a66c2] bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Program Enrollments
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{partnershipCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-3 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Your Active Ecosystem Linkages</h1>
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-[#0a66c2] animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading linkages...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLinkages.map((linkage) => (
              <div
                key={linkage.id}
                className={`border rounded-lg p-4 shadow-sm relative transition-all hover:shadow-md ${
                  linkage.status === 'At-Risk'
                    ? 'border-orange-200 bg-orange-50/30'
                    : 'border-gray-200'
                }`}
              >
                {/* Health Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                  linkage.status === 'At-Risk'
                    ? 'text-orange-600 bg-orange-100'
                    : linkage.is_partnership
                    ? 'text-green-600 bg-green-50'
                    : 'text-green-600 bg-green-50'
                }`}>
                  {linkage.status === 'At-Risk' ? (
                    <><AlertCircle className="h-3 w-3" /> Health: {linkage.health_score}%</>
                  ) : linkage.is_partnership ? (
                    <><TrendingUp className="h-3 w-3" /> Active</>
                  ) : (
                    <><TrendingUp className="h-3 w-3" /> Health: {linkage.health_score}%</>
                  )}
                </div>

                {/* Avatar & Info */}
                <div className="flex gap-4">
                  <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center ${
                    linkage.is_partnership ? 'rounded-lg bg-purple-100' : 'rounded-full bg-blue-100'
                  }`}>
                    {linkage.is_partnership ? (
                      <Building2 className="h-6 w-6 text-purple-600" />
                    ) : (
                      <span className={`font-bold text-xl ${
                        linkage.status === 'At-Risk' ? 'text-gray-600' : 'text-[#0a66c2]'
                      }`}>{linkage.initials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{linkage.name}</h3>
                    <p className="text-sm text-gray-500">{linkage.type} • {linkage.topic}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className={`mt-4 pt-4 border-t ${
                  linkage.status === 'At-Risk' ? 'border-orange-100' : 'border-gray-100'
                }`}>
                  {linkage.program && (
                    <p className="text-xs text-gray-500 mb-2">Linked via: <strong>{linkage.program}</strong></p>
                  )}
                  {linkage.resource && (
                    <p className="text-xs text-gray-500 mb-2">Resource: <strong>{linkage.resource}</strong></p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      linkage.status === 'At-Risk' ? 'text-orange-600 font-medium' : 'text-gray-500'
                    }`}>
                      Last interaction: {linkage.last_interaction}
                    </span>
                    {linkage.status === 'At-Risk' ? (
                      <button
                        onClick={() => handleReengage(linkage)}
                        disabled={actionStatus[linkage.id] === 'nudging'}
                        className="text-sm text-orange-700 font-semibold bg-white border border-orange-200 px-3 py-1 rounded-md hover:bg-orange-100 shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        {actionStatus[linkage.id] === 'nudging' ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                        ) : (
                          <><Mail className="h-3 w-3" /> Re-engage</>
                        )}
                      </button>
                    ) : linkage.is_partnership ? (
                      <button className="text-sm text-[#0a66c2] font-semibold flex items-center gap-1 hover:underline">
                        Access Portal <ExternalLink className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLogInteraction(linkage.id)}
                        disabled={actionStatus[linkage.id] === 'logging'}
                        className="text-sm text-[#0a66c2] font-semibold hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {actionStatus[linkage.id] === 'logging' ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Logging...</>
                        ) : actionStatus[linkage.id] === 'success' ? (
                          <><CheckCircle className="h-3 w-3 text-green-600" /> Logged!</>
                        ) : (
                          'Log Interaction'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nudge Email Modal */}
      {nudgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#0a66c2]" />
                <h3 className="font-semibold text-gray-900">AI-Generated Nudge Email</h3>
              </div>
              <button onClick={() => setNudgeModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{nudgeModal.subject}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</label>
                <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed">
                  {nudgeModal.body}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNudgeModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#0a66c2] hover:bg-blue-700 rounded-md">
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
