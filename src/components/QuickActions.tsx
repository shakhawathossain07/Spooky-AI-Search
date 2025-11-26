import { useState } from 'react';

interface QuickActionsProps {
  onAction: (query: string) => void;
}

const QUICK_ACTIONS = [
  { icon: '🔥', label: 'Trending', query: 'trending topics today' },
  { icon: '📰', label: 'News', query: 'latest news today' },
  { icon: '🎬', label: 'Movies', query: 'best movies 2024' },
  { icon: '💻', label: 'Tech', query: 'latest technology news' },
  { icon: '🎮', label: 'Gaming', query: 'popular video games' },
  { icon: '🔬', label: 'Science', query: 'latest scientific discoveries' },
  { icon: '🌍', label: 'World', query: 'world events today' },
  { icon: '💡', label: 'Random', query: 'interesting facts' },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {QUICK_ACTIONS.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onAction(action.query)}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`group relative px-4 py-2 rounded-full border transition-all duration-300 ${
            hoveredIndex === idx
              ? 'bg-purple-500/20 border-purple-500/50 scale-105'
              : 'bg-gray-800/30 border-gray-700/50 hover:border-purple-500/30'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`text-lg transition-transform duration-300 ${hoveredIndex === idx ? 'scale-125' : ''}`}>
              {action.icon}
            </span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </span>
          
          {/* Glow effect */}
          {hoveredIndex === idx && (
            <span className="absolute inset-0 rounded-full bg-purple-500/10 blur-md -z-10" />
          )}
        </button>
      ))}
    </div>
  );
}
