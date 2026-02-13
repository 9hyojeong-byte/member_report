
import React, { useState } from 'react';
import DataInput from './components/DataInput';
import ReportView from './components/ReportView';
import { ParsedData, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('input');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const handleDataComplete = (data: ParsedData) => {
    setParsedData(data);
    setView('report');
    // Scroll to top when switching views
    window.scrollTo(0, 0);
  };

  const handleBackToInput = () => {
    setView('input');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen">
      {view === 'input' ? (
        <DataInput onComplete={handleDataComplete} />
      ) : (
        parsedData && (
          <ReportView data={parsedData} onBack={handleBackToInput} />
        )
      )}
      
      {/* App Footer (Visible only in non-print mode) */}
      <footer className="no-print mt-auto py-8 text-center text-gray-400 text-sm">
        &copy; 2024 Membership Report Generator System
      </footer>
    </div>
  );
};

export default App;
