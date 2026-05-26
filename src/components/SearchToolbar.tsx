import { Search, Tag, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function SearchToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: SearchToolbarProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statuses = ['All', 'completed', 'processing', 'new'];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search articles, keywords, business..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Tag size={14} />
          <span className="hidden sm:inline">Manage Tag</span>
        </button>

        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filter</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="capitalize">{statusFilter === 'All' ? 'Status' : statusFilter}</span>
            <ChevronDown size={14} />
          </button>

          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusFilterChange(s);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors capitalize ${
                      statusFilter === s ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
