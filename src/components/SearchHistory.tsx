import { useState, useEffect } from 'react';

interface HistoryItem {
  query: string;
  timestamp: number;
}

interface SearchHistoryProps {
  onSelect: (query: string) => void;
}

export default function SearchHistory({ onSelect }: SearchHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistory([]);
  };

  const removeItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((_, i) => i !== index);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Searches
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="p-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 px-2">Recent</span>
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {history.slice(0, 10).map((item, idx) => (
              <button
                key={idx}
                onClick={() => { onSelect(item.query); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-500/10 transition-colors group"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="flex-1 text-left text-sm text-gray-300 truncate">{item.query}</span>
                <span className="text-xs text-gray-600">{formatTime(item.timestamp)}</span>
                <button
                  onClick={(e) => removeItem(idx, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Helper to save search to history
export function saveToHistory(query: string) {
  const saved = localStorage.getItem('searchHistory');
  const history: HistoryItem[] = saved ? JSON.parse(saved) : [];
  
  // Remove duplicate if exists
  const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());
  
  // Add new item at beginning
  filtered.unshift({ query, timestamp: Date.now() });
  
  // Keep only last 20
  const trimmed = filtered.slice(0, 20);
  
  localStorage.setItem('searchHistory', JSON.stringify(trimmed));
}
