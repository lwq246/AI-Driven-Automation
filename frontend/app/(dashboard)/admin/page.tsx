'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Activity, ShieldCheck, AlertTriangle, Loader2, CheckCircle, Play, RefreshCw } from 'lucide-react';
import { fetchMetrics, runHealthCheck, type EcosystemMetrics, type HealthCheckResult } from '@/lib/api';

const DEMO_METRICS: EcosystemMetrics = {
  total_active_linkages: 142,
  avg_linkage_health: 86.0,
  at_risk_linkages: 8,
  matches_generated: 1024,
  trending_needs: [],
};

export default function AdminPage() {
  const [metrics, setMetrics] = useState<EcosystemMetrics>(DEMO_METRICS);
  const [loading, setLoading] = useState(true);
  const [healthCheckResult, setHealthCheckResult] = useState<HealthCheckResult | null>(null);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchMetrics();
        setMetrics(data);
      } catch {
        console.log('Using demo metrics data');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const handleHealthCheck = async () => {
    setHealthCheckLoading(true);
    try {
      const result = await runHealthCheck();
      setHealthCheckResult(result);
      // Reload metrics after health check
      const updatedMetrics = await fetchMetrics();
      setMetrics(updatedMetrics);
    } catch (err) {
      setHealthCheckResult(null);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const healthColor = metrics.avg_linkage_health >= 80 ? 'text-green-600' :
                       metrics.avg_linkage_health >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ecosystem Governance</h1>
          <p className="text-sm text-gray-500">Cradle Program Overseer Dashboard</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleHealthCheck}
            disabled={healthCheckLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {healthCheckLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Running...</>
            ) : (
              <><Play className="h-4 w-4" /> Run Health Check</>
            )}
          </button>
          <button className="bg-[#0a66c2] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700">
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* Health Check Result Banner */}
      {healthCheckResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Health Check Completed</p>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div>
                <p className="text-xs text-green-700">Evaluated</p>
                <p className="text-lg font-bold text-green-800">{healthCheckResult.linkages_evaluated}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Decayed</p>
                <p className="text-lg font-bold text-green-800">{healthCheckResult.linkages_decayed}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Marked At-Risk</p>
                <p className="text-lg font-bold text-orange-600">{healthCheckResult.linkages_marked_at_risk}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Nudges Triggered</p>
                <p className="text-lg font-bold text-blue-600">{healthCheckResult.nudges_triggered}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setHealthCheckResult(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Activity className="h-5 w-5 text-[#0a66c2]" />
            <span className="text-sm font-medium">Total Active Linkages</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.total_active_linkages}
          </span>
          <p className="text-xs text-green-600 mt-2 font-medium">↑ 12% from last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Avg Linkage Health</span>
          </div>
          <span className={`text-3xl font-bold ${healthColor}`}>
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : `${metrics.avg_linkage_health}%`}
          </span>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {metrics.avg_linkage_health >= 80 ? 'Stable ecosystem' : 'Needs attention'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">At-Risk Linkages</span>
          </div>
          <span className="text-3xl font-bold text-orange-600">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.at_risk_linkages}
          </span>
          <p className="text-xs text-orange-600 mt-2 font-medium">AI Nudges Sent</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Matches Generated</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : metrics.matches_generated.toLocaleString()}
          </span>
          <p className="text-xs text-gray-500 mt-2 font-medium">Via Gemini + pgvector</p>
        </div>
      </div>

      {/* Main Governance View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Linkage Activity (Audit Log)</h2>
            <button
              onClick={handleHealthCheck}
              disabled={healthCheckLoading}
              className="text-xs text-[#0a66c2] font-medium flex items-center gap-1 hover:underline"
            >
              <RefreshCw className={`h-3 w-3 ${healthCheckLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div className="p-4 space-y-4">
             <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0a66c2] text-xs font-bold">SYS</div>
               <div>
                 <p className="text-sm text-gray-900">Auto-generated nudge sent to <strong>Johari</strong> (Mentor) regarding declining health with Startup X.</p>
                 <span className="text-xs text-gray-500">2 hours ago</span>
               </div>
             </div>
             <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
               <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">OK</div>
               <div>
                 <p className="text-sm text-gray-900"><strong>TechNova Solutions</strong> verified via SSM OCR module (Gemini Vision). Status updated to Verified.</p>
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
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-[#0a66c2] h-1.5 rounded-full" style={{width: '45%'}}></div></div>
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
