'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Sparkles } from 'lucide-react';
import { verifySSM, type SSMVerifyResponse } from '@/lib/api';

export default function OnboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<'startup' | 'mentor'>('startup');
  const [companyName, setCompanyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<SSMVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const result = await verifySSM('demo-startup-001', selectedFile);
      setVerifyResult(result);

      // Auto-fill company name if extracted
      if (result.company_name && !companyName) {
        setCompanyName(result.company_name);
      }
    } catch (err) {
      setError('SSM verification failed. Please ensure the backend is running with a valid Gemini API key.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <span className="text-[#0a66c2] font-bold text-3xl tracking-tighter">in</span>
          <span className="ml-2 font-bold text-gray-800 text-xl">Cradle Ecosystem</span>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Verify Your Organization</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role in the Ecosystem</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('startup')}
                  className={`p-4 rounded-lg text-center cursor-pointer transition-all ${
                    role === 'startup'
                      ? 'border-2 border-[#0a66c2] bg-blue-50'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`block font-semibold ${role === 'startup' ? 'text-[#0a66c2]' : 'text-gray-700'}`}>Startup</span>
                </div>
                <div
                  onClick={() => setRole('mentor')}
                  className={`p-4 rounded-lg text-center cursor-pointer transition-all ${
                    role === 'mentor'
                      ? 'border-2 border-[#0a66c2] bg-blue-50'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`block font-semibold ${role === 'mentor' ? 'text-[#0a66c2]' : 'text-gray-700'}`}>Mentor / Partner</span>
                </div>
              </div>
            </div>

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
                <div className={`mt-3 p-4 rounded-lg border ${
                  verifyResult.verification_status === 'Verified'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.verification_status === 'Verified' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      verifyResult.verification_status === 'Verified' ? 'text-green-800' : 'text-yellow-800'
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

              {/* Error */}
              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0a66c2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-colors"
              >
                Complete Verification & Enter Feed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
