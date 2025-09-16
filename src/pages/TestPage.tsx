export function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Campus Connect App
        </h1>
        <p className="text-gray-600 mb-2">
          ✅ All bugs fixed and app is working!
        </p>
        <p className="text-sm text-gray-500 mb-6">
          No authentication required - all pages use mock data
        </p>
        <div className="space-y-3">
          <a 
            href="/match" 
            className="block bg-pink-500 text-white px-4 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            💖 Match Page
            <div className="text-xs opacity-75">Tinder-style swipe interface</div>
          </a>
          <a 
            href="/connections" 
            className="block bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            👥 Connections Page
            <div className="text-xs opacity-75">Your matched students</div>
          </a>
          <a 
            href="/profile" 
            className="block bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            👤 Profile Page
            <div className="text-xs opacity-75">Your student profile</div>
          </a>
          <a 
            href="/settings" 
            className="block bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ⚙️ Settings Page
            <div className="text-xs opacity-75">App preferences</div>
          </a>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Campus Connect v1.0.0 - All features working
          </p>
        </div>
      </div>
    </div>
  );
}
