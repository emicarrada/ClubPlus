import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Placeholder App component for Vercel deployment testing
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Club+ MVP
        </h1>
        <p className="text-gray-600 mb-6">
          Frontend configured and ready for deployment
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Vercel Configuration Ready</p>
          <p>✅ TypeScript Setup Complete</p>
          <p>✅ Vite Build System Ready</p>
          <p>✅ API Integration Prepared</p>
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            Frontend development will begin in Week 3
          </p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
