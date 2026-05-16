export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-linkedin-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <span className="text-linkedin-blue font-bold text-3xl tracking-tighter">in</span>
          <span className="ml-2 font-bold text-gray-800 text-xl">Cradle Ecosystem</span>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Verify Your Organization</h2>
          
          <form className="space-y-6" action="/feed">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role in the Ecosystem</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-linkedin-blue bg-blue-50 p-4 rounded-lg text-center cursor-pointer">
                  <span className="block font-semibold text-linkedin-blue">Startup</span>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                  <span className="block font-semibold text-gray-700">Mentor / Partner</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="mt-1">
                <input id="company" type="text" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-linkedin-blue focus:border-linkedin-blue sm:text-sm" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
              <label className="block text-sm font-medium text-gray-700 text-center mb-2">Upload SSM Certificate</label>
              <p className="text-xs text-gray-500 text-center mb-4">Required for automated business verification via AI OCR.</p>
              <div className="flex justify-center">
                 <button type="button" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">
                   Choose File
                 </button>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-linkedin-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-blue">
                Complete Verification & Enter Feed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
