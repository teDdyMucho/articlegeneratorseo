import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Plus, LogOut } from 'lucide-react';

interface NavbarProps {
  onCreateClick: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export default function Navbar({ onCreateClick, onRefresh, onSignOut }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-[#050816]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20"
            >
              <span className="text-white font-bold text-sm">AD</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-tight">Article Dashboard</h1>
              <p className="text-gray-400 text-xs">Create, monitor and manage your content</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-white font-bold text-base">Article Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create Article</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
