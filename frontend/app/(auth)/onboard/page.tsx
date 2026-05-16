'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Sparkles, Link as LinkIcon } from 'lucide-react';
import { verifySSM, type SSMVerifyResponse } from '@/lib/api';
import { supabase } from '@/lib/supabase';

type RoleType = 'startup' | 'mentor' | 'partner';

export default function OnboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<RoleType>('startup');
  const [companyName, setCompanyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<SSMVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mentor/Partner specific fields
  const [fullName, setFullName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [expertiseSkills, setExpertiseSkills] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });
  }, [router]);

  // Reset verification when role changes
  useEffect(() => {
    setSelectedFile(null);
    setVerifyResult(null);
    setError(null);
  }, [role]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerifyResult(null);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    setVerifying(true);
    setError(null);
    setVerifyResult(null);

    try {
      const result = await verifySSM(selectedFile);
      setVerifyResult(result);

      // Auto-fill company name if extracted (startup only)
      if (result.company_name && !companyName && role === 'startup') {
        setCompanyName(result.company_name);
      }
    } catch (err) {
      setError(`Document verification failed. Please ensure the backend is running with a valid Gemini API key., ${err}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session) {
        router.push('/login');
        return;
      }

      // Validation per role
      if (role === 'startup') {
        if (!verifyResult) {
          throw new Error('Startups must upload and verify their SSM certificate before proceeding.');
        }
        if (!companyName && !verifyResult?.company_name) {
          throw new Error('Company name is required.');
        }
      } else if (role === 'mentor') {
        if (!fullName.trim()) {
          throw new Error('Full name is required for mentors.');
        }
        if (!linkedinUrl.trim()) {
          throw new Error('LinkedIn profile URL is required for mentor verification.');
        }
      } else if (role === 'partner') {
        if (!companyName.trim()) {
          throw new Error('Organization name is required for partners.');
        }
        if (!serviceCategory.trim()) {
          throw new Error('Service category is required for partners.');
        }
      }

      const payload: Record<string, any> = {
        role: role === 'startup' ? 'Startup' : role === 'mentor' ? 'Mentor' : 'Partner',
        verification_status: 'Pending',
      };

      if (role === 'startup') {
        payload.company_name = verifyResult?.company_name || companyName;
        payload.industry = 'Technology';
        payload.verification_status = verifyResult?.verification_status || 'Pending';
      } else if (role === 'mentor') {
        payload.company_name = fullName; // name field maps to company_name in backend
        payload.expertise_skills = expertiseSkills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        payload.linkedin_url = linkedinUrl;
      } else if (role === 'partner') {
        payload.company_name = companyName;
        payload.service_category = serviceCategory;
      }

      console.log('Registration payload:', payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to complete profile');
      }

      router.push('/feed');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Error completing profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCompleteProfile();
  };

  const roleCards: { value: RoleType; label: string; description: string }[] = [
    { value: 'startup', label: 'Startup', description: 'Register your company' },
    { value: 'mentor', label: 'Mentor', description: 'Guide startups to grow' },
    { value: 'partner', label: 'Partner', description: 'Sponsor or provide services' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <span className="text-[#0a66c2] font-bold text-3xl tracking-tighter">in</span>
          <span className="ml-2 font-bold text-gray-800 text-xl">Cradle Ecosystem</span>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join the Ecosystem</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection - 3 separate cards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role in the Ecosystem</label>
              <div className="grid grid-cols-3 gap-3">
                {roleCards.map((rc) => (
                  <div
                    key={rc.value}
                    onClick={() => setRole(rc.value)}
                    className={`p-4 rounded-lg text-center cursor-pointer transition-all ${role === rc.value
                      ? 'border-2 border-[#0a66c2] bg-blue-50'
                      : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <span className={`block font-semibold text-sm ${role === rc.value ? 'text-[#0a66c2]' : 'text-gray-700'}`}>
                      {rc.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">{rc.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================== */}
            {/* STARTUP-SPECIFIC FIELDS  */}
            {/* ======================== */}
            {role === 'startup' && (
              <>
                {/* Company Name */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <div className="mt-1">
                    <input
                      id="company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                      placeholder={verifyResult?.company_name ? '' : 'Enter company name or auto-detect from SSM'}
                    />
                  </div>
                </div>

                {/* SSM Upload */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
                  <label className="block text-sm font-medium text-gray-700 text-center mb-2">Upload SSM Certificate</label>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Required for automated business verification via <strong>Gemini Vision AI</strong> OCR.
                  </p>

                  {selectedFile ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 mb-3">
                      <FileText className="h-8 w-8 text-[#0a66c2]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setVerifyResult(null); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" /> Choose File
                      </button>
                    </div>
                  )}

                  {/* Verify Button */}
                  {selectedFile && !verifyResult && (
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifying}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-[#0a66c2] text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {verifying ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Verifying with Gemini Vision...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Verify with AI</>
                      )}
                    </button>
                  )}

                  {/* Verification Result */}
                  {verifyResult && (
                    <div className={`mt-3 p-4 rounded-lg border ${verifyResult.verification_status === 'Verified'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                      }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {verifyResult.verification_status === 'Verified' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className={`text-sm font-semibold ${verifyResult.verification_status === 'Verified' ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                          {verifyResult.message}
                        </span>
                      </div>
                      {verifyResult.company_name && (
                        <p className="text-sm text-gray-700">
                          <strong>Company:</strong> {verifyResult.company_name}
                        </p>
                      )}
                      {verifyResult.registration_number && (
                        <p className="text-sm text-gray-700">
                          <strong>Registration #:</strong> {verifyResult.registration_number}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Confidence: {Math.round(verifyResult.confidence * 100)}% | Powered by Gemini Vision
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ======================== */}
            {/* MENTOR-SPECIFIC FIELDS   */}
            {/* ======================== */}
            {role === 'mentor' && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">Areas of Expertise</label>
                  <div className="mt-1">
                    <input
                      id="expertise"
                      type="text"
                      value={expertiseSkills}
                      onChange={(e) => setExpertiseSkills(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                      placeholder="e.g. Enterprise Sales, Fintech, AI Strategy"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                    <LinkIcon className="h-4 w-4 inline mr-1" />
                    LinkedIn Profile URL
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Required for identity verification. Your LinkedIn profile will be reviewed to confirm your professional background.
                  </p>
                  <input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </>
            )}

            {/* ======================== */}
            {/* PARTNER-SPECIFIC FIELDS  */}
            {/* ======================== */}
            {role === 'partner' && (
              <>
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <div className="mt-1">
                    <input
                      id="orgName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                      placeholder="Your organization or company name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">Service Category</label>
                  <div className="mt-1">
                    <select
                      id="serviceCategory"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0a66c2] focus:border-[#0a66c2] sm:text-sm"
                    >
                      <option value="">Select a category...</option>
                      <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                      <option value="Legal & Compliance">Legal & Compliance</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Marketing & PR">Marketing & PR</option>
                      <option value="HR & Talent">HR & Talent</option>
                      <option value="Technology & Development">Technology & Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
                  <label className="block text-sm font-medium text-gray-700 text-center mb-2">Upload Business Document</label>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Upload a business registration, partnership agreement, or official letterhead for verification via <strong>Gemini Vision AI</strong>.
                  </p>

                  {selectedFile ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 mb-3">
                      <FileText className="h-8 w-8 text-[#0a66c2]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setVerifyResult(null); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" /> Choose File
                      </button>
                    </div>
                  )}

                  {selectedFile && !verifyResult && (
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifying}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-[#0a66c2] text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {verifying ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Verifying document...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Verify with AI</>
                      )}
                    </button>
                  )}

                  {verifyResult && (
                    <div className={`mt-3 p-4 rounded-lg border ${verifyResult.verification_status === 'Verified'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                      }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {verifyResult.verification_status === 'Verified' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className={`text-sm font-semibold ${verifyResult.verification_status === 'Verified' ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                          {verifyResult.message}
                        </span>
                      </div>
                      {verifyResult.company_name && (
                        <p className="text-sm text-gray-700"><strong>Organization:</strong> {verifyResult.company_name}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0a66c2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration & Enter Feed'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
