import { LineChart, RefreshCw } from 'lucide-react';

export const AnalyzeButton = ({ onClick, isAnalyzing, disabled, lastUpdateTime }) => {
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  const hasRecentUpdate = lastUpdateTime && new Date(lastUpdateTime).toDateString() === new Date().toDateString();

  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
        transition-colors duration-150 ease-in-out
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : hasRecentUpdate
            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            : 'bg-black text-white hover:bg-gray-800'}
      `}
      title={lastUpdateTime ? `Last updated: ${formatLastUpdate(lastUpdateTime)}` : ''}
    >
      {isAnalyzing ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
          <span>Analyzing...</span>
        </>
      ) : hasRecentUpdate ? (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Updated {formatLastUpdate(lastUpdateTime)}</span>
        </>
      ) : (
        <>
          <LineChart className="h-4 w-4" />
          <span>Analyze Entries</span>
        </>
      )}
    </button>
  );
};